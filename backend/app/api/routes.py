from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.core.database import get_session
from app.models.schemas import Event, UserRegistration, EventListResponse, User, EventCreate
from app.services.scraper import scrape_events_playwright # Async import
from app.auth import get_current_user
from sqlmodel import SQLModel
import uuid

router = APIRouter()

# --- 1. SYNC (Admin Only / Debug) ---
@router.post("/sync")
async def sync_events(city: str = "chennai", session: AsyncSession = Depends(get_session)):
    """
    Triggers the Playwright Scraper
    """
    print(f"Starting Sync for {city}...")
    try:
        print("Calling scraper function...")
        events_data = await scrape_events_playwright(city)
        print("Scraper returned.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    saved_count = 0
    for data in events_data:
        # Check duplicates via eventbrite_id
        stmt = select(Event).where(Event.eventbrite_id == data["eventbrite_id"])
        result = await session.execute(stmt)
        existing = result.scalars().first()
        
        if not existing:
            new_event = Event(**data)
            session.add(new_event)
            saved_count += 1
            
    await session.commit()
    return {"status": "success", "added": saved_count, "total_found": len(events_data)}

# --- 1.5 CREATE EVENT (User Generated) ---

@router.post("/events", response_model=Event)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Allows authenticated users to create a new event.
    """
    # Generate unique internal ID
    custom_id = f"chk-{uuid.uuid4()}"
    
    # Create Event Object
    # Extract Pro fields for raw_data storage
    raw_data_dump = {
        "source": "InfiniteBZ", 
        "created_by": current_user.email,
        "organizer_email": event_data.organizer_email,
        "price": event_data.price,
        "capacity": event_data.capacity
    }
    
    new_event = Event(
        **event_data.dict(exclude={"organizer_email", "price", "organizer_name"}), # Exclude non-db columns if they match exact table columns, or just pass as is if ignored by SQLModel init (safer to allow)
        eventbrite_id=custom_id,
        url=f"https://infinitebz.com/events/{custom_id}", 
        organizer_name=event_data.organizer_name or current_user.full_name or "Community Member",
        raw_data=raw_data_dump
    )
    
    session.add(new_event)
    await session.commit()
    await session.refresh(new_event)
    
    return new_event

    return new_event

@router.get("/events/my-events")
async def get_my_events(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Fetch events created by the current user.
    """
    # Query events where raw_data->>'created_by' matches email
    # Note: JSONB querying in SQLModel/SQLAlchemy
    from sqlalchemy import cast, String
    from sqlalchemy.dialects.postgresql import JSONB
    
    # 1. Get Events
    query = select(Event).where(
        cast(Event.raw_data['created_by'], String) == f'"{current_user.email}"' 
        # Note: JSON value might be quoted or not depending on driver. 
        # Safest is often astext or explicit cast. 
        # Let's try simple python filtration if list is small, or specific operator if large.
        # Given potential complexities with JSON operators in asyncpg/sqlmodel, 
        # let's fetch all "Source=InfiniteBZ" and filter in python for MVP reliability 
        # unless we want to risk syntax errors.
        # Actually, let's try the proper JSONB contains operator which is cleaner.
    )
    
    # Alternative: Use the contains operator @>
    # query = select(Event).where(Event.raw_data.contains({"created_by": current_user.email}))
    
    # Let's stick to the containment operator, it's standard PG.
    stmt = select(Event).where(Event.raw_data.contains({"created_by": current_user.email}))
    result = await session.execute(stmt)
    my_events = result.scalars().all()
    
    # 2. Calculate Stats
    active_count = len(my_events) # Assuming all are active for now
    pending_count = 0 
    total_registrations = 0
    
    # For each event, get registration count (this could be optimized with a join)
    events_with_stats = []
    for event in my_events:
        # Count registrations
        reg_stmt = select(func.count()).select_from(UserRegistration).where(UserRegistration.event_id == event.id)
        reg_res = await session.execute(reg_stmt)
        reg_count = reg_res.scalar()
        total_registrations += reg_count
        
        events_with_stats.append({
            **event.dict(),
            "registration_count": reg_count,
            "status": "Active" # Hardcoded for now
        })
        
    return {
        "stats": {
            "active": active_count,
            "pending": pending_count,
            "total_registrations": total_registrations
        },
        "events": events_with_stats
    }

# --- 2. PUBLIC EVENTS API ---
from sqlalchemy import func, select, or_, desc, cast, Date
from datetime import datetime, date as date_type
@router.get("/events", response_model=EventListResponse) # Changed response model
async def list_events(
    city: str = None, 
    category: str = None, 
    search: str = None,
    source: str = None,
    is_free: str = None, # 'true', 'false', or None
    mode: str = None,    # 'online', 'offline', or None
    date: str = None,    # 'YYYY-MM-DD'
    page: int = 1,
    limit: int = 10,
    session: AsyncSession = Depends(get_session)
):
    """
    Returns events with optional filtering (City, Search) and true pagination.
    """
    from sqlalchemy import or_

    offset = (page - 1) * limit
    
    # Base query for filtering
    filter_query = select(Event)
    
    # 0. Category/Industry Filter (Keyword Search)
    if category and category.lower() != "all":
        # Broaden logic: Map category names to a list of related keywords
        keyword_map = {
            "startup": ["startup", "founder", "entrepreneur", "venture", "pitch", "funding", "incubator", "accelerator", "innovation"],
            "business": ["business", "networking", "marketing", "sales", "finance", "leadership", "management", "corporate", "career", "resume", "job", "interview", "workshop", "money", "income", "profit", "ecommerce", "trade", "expo", "exhibition", "organization", "team", "strategy", "communication"],
            "tech": ["tech", "software", "developer", "ai", "data", "code", "programming", "cloud", "security", "web", "digital", "cyber", "electronics", "engineering"],
            "music": ["music", "concert", "live", "dj", "band", "festival", "performance"],
            "sports": ["sport", "cricket", "football", "run", "marathon", "yoga", "fitness", "badminton"],
            "arts": ["art", "design", "creative", "gallery", "painting"]
        }
        
        # Get keywords for the selected category (default to just the category name if not in map)
        search_keywords = keyword_map.get(category.lower(), [category.lower()])
        
        # Construct OR query for all keywords in Title OR Description
        conditions = []
        for kw in search_keywords:
            kw_term = f"%{kw}%"
            conditions.append(Event.title.ilike(kw_term))
            conditions.append(Event.description.ilike(kw_term))
            
        filter_query = filter_query.where(or_(*conditions))
        
    # 1. City Filter
    if city and city.lower() != "all":
        filter_query = filter_query.where(Event.venue_address.ilike(f"%{city}%"))
        
    # 2. Search Filter (Title, Desc, Venue, Organizer)
    if search:
        search_term = f"%{search}%"
        filter_query = filter_query.where(
            or_(
                Event.title.ilike(search_term),
                Event.description.ilike(search_term),
                Event.venue_name.ilike(search_term),
                Event.venue_address.ilike(search_term),
                Event.organizer_name.ilike(search_term)
            )
        )
        
    # 3. Source Filter (Platform)
    if source and source.strip().lower() != "all":
        # Check URL for the source name (e.g. 'eventbrite', 'meetup')
        filter_query = filter_query.where(Event.url.ilike(f"%{source.strip()}%"))
        # Add more sources here if needed
        
    # 4. Cost Filter
    if is_free:
        if is_free.lower() == "free":
            filter_query = filter_query.where(Event.is_free == True)
        elif is_free.lower() == "paid":
            filter_query = filter_query.where(Event.is_free == False)
            
    # 5. Mode Filter
    if mode:
        if mode.lower() == "online":
            filter_query = filter_query.where(Event.online_event == True)
        elif mode.lower() == "offline":
            filter_query = filter_query.where(Event.online_event == False)
    
    # 6. Date Filter
    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            filter_query = filter_query.where(cast(Event.start_time, Date) == filter_date)
        except ValueError:
            pass # Ignore invalid date formats
    
    # 3. Get TOTAL Count (Count BEFORE applying limit/offset)
    # We substitute the selection of 'Event' with 'count(Event.id)'
    count_query = select(func.count(Event.id)).select_from(filter_query.subquery())
    
    # SQLAlchemy Async execution for count
    # Note: Using subquery approach is safer for complex wheres
    # Simplified: select(func.count()).select_from(Event).where(...)
    
    # Re-constructing count query cleanly:
    count_stmt = select(func.count()).select_from(Event)
    if city and city.lower() != "all":
        count_stmt = count_stmt.where(Event.venue_address.ilike(f"%{city}%"))
    if search:
        search_term = f"%{search}%"
        count_stmt = count_stmt.where(
            or_(
                Event.title.ilike(search_term),
                Event.description.ilike(search_term),
                Event.venue_name.ilike(search_term),
                Event.venue_address.ilike(search_term),
                Event.organizer_name.ilike(search_term)
            )
        )

    # Apply same filters to count_stmt
    if category and category.lower() != "all":
        keyword_map = {
            "startup": ["startup", "founder", "entrepreneur", "venture", "pitch", "funding", "incubator", "accelerator", "innovation"],
            "business": ["business", "networking", "marketing", "sales", "finance", "leadership", "management", "corporate", "career", "resume", "job", "interview", "workshop", "money", "income", "profit", "ecommerce", "trade", "expo", "exhibition", "organization", "team", "strategy", "communication"],
            "tech": ["tech", "software", "developer", "ai", "data", "code", "programming", "cloud", "security", "web", "digital", "cyber", "electronics", "engineering"],
            "music": ["music", "concert", "live", "dj", "band", "festival", "performance"],
            "sports": ["sport", "cricket", "football", "run", "marathon", "yoga", "fitness", "badminton"],
            "arts": ["art", "design", "creative", "gallery", "painting"]
        }
        search_keywords = keyword_map.get(category.lower(), [category.lower()])
        
        conditions = []
        for kw in search_keywords:
            kw_term = f"%{kw}%"
            conditions.append(Event.title.ilike(kw_term))
            conditions.append(Event.description.ilike(kw_term))
            
        count_stmt = count_stmt.where(or_(*conditions))
        
    if source and source.strip().lower() != "all":
        count_stmt = count_stmt.where(Event.url.ilike(f"%{source.strip()}%"))

    if is_free:
        if is_free.lower() == "free":
            count_stmt = count_stmt.where(Event.is_free == True)
        elif is_free.lower() == "paid":
            count_stmt = count_stmt.where(Event.is_free == False)

    if mode:
        if mode.lower() == "online":
            count_stmt = count_stmt.where(Event.online_event == True)
        elif mode.lower() == "offline":
            count_stmt = count_stmt.where(Event.online_event == False)

    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            count_stmt = count_stmt.where(cast(Event.start_time, Date) == filter_date)
        except ValueError:
            pass

    count_result = await session.execute(count_stmt)
    total_events = count_result.scalar()

    # 4. Get DATA (Apply limit/offset)
    query = filter_query.order_by(Event.start_time).offset(offset).limit(limit)
        
    result = await session.execute(query)
    events = result.scalars().all()
    
    return EventListResponse(
        data=events,
        total=total_events,
        page=page,
        limit=limit
    )

# --- 3. TRACKING ---
@router.post("/track-click")
async def track_click(registration: UserRegistration, session: AsyncSession = Depends(get_session)):
    """
    Logs a user clicking 'Register'. 
    NOTE: This is just counting intent, not actual API registration.
    """
    # Force server-side timestamp to ensure valid datetime object
    from datetime import datetime
    registration.registered_at = datetime.now()
    
    session.add(registration)
    await session.commit()
    await session.refresh(registration)
    return {"status": "tracked", "id": registration.id}

# --- 4. AUTO-REGISTRATION ENDPOINT ---
from app.models.schemas import UserRegistration, User
from app.services.registrar import auto_register_playwright
from app.auth import get_current_user

@router.post("/events/{event_id}/register")
async def register_for_event(
    event_id: int, 
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # 1. Get Event Details
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not event.is_free:
         raise HTTPException(status_code=400, detail="Auto-registration currently supports FREE events only.")

    # 2. Check if already registered
    stmt = select(UserRegistration).where(
        UserRegistration.user_email == current_user.email,
        UserRegistration.event_id == event_id
    )
    result = await session.execute(stmt)
    existing = result.scalars().first()
    if existing:
        return {"status": "ALREADY_REGISTERED", "message": "You are already registered for this event."}

    # 3. MANUAL CONFIRMATION (API called after user confirms in UI)
    
    # Generate a Self-Verified Confirmation ID
    import time
    confirmation_id = f"SELF-{int(time.time())}"

    new_reg = UserRegistration(
        event_id=event_id, 
        user_email=current_user.email,
        confirmation_id=confirmation_id,
        status="SUCCESS"
    )
    session.add(new_reg)
    await session.commit()

    return {
        "status": "SUCCESS",
        "message": "Registration verified and saved!",
        "confirmation_id": confirmation_id
    }

# --- 5. USER PROFILE ENDPOINT ---
class UserProfileUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class UserProfileResponse(SQLModel):
    id: int
    email: str
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

@router.get("/user/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's profile information.
    """
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        job_title=current_user.job_title,
        company=current_user.company,
        phone=current_user.phone,
        bio=current_user.bio,
        profile_image=current_user.profile_image
    )

@router.put("/user/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Update current user's profile information.
    """
    # Get the user
    user = await session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    # Update full_name based on first_name and last_name
    if profile_data.first_name is not None or profile_data.last_name is not None:
        first_name = profile_data.first_name if profile_data.first_name is not None else user.first_name or ""
        last_name = profile_data.last_name if profile_data.last_name is not None else user.last_name or ""
        user.full_name = f"{first_name} {last_name}".strip()

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "job_title": user.job_title,
            "company": user.company,
            "phone": user.phone,
            "bio": user.bio,
            "profile_image": user.profile_image
        }
    }
