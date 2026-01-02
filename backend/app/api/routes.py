from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_session
from app.models.schemas import Event, UserRegistration, EventListResponse
from app.services.scraper import scrape_events_playwright # Async import

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

# --- 2. PUBLIC EVENTS API ---
from sqlalchemy import func
@router.get("/events", response_model=EventListResponse) # Changed response model
async def list_events(
    city: str = None, 
    category: str = None, 
    search: str = None,
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
    
    # 1. City Filter
    if city:
        filter_query = filter_query.where(Event.venue_name.ilike(f"%{city}%"))
        
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
    
    # 3. Get TOTAL Count (Count BEFORE applying limit/offset)
    # We substitute the selection of 'Event' with 'count(Event.id)'
    count_query = select(func.count(Event.id)).select_from(filter_query.subquery())
    
    # SQLAlchemy Async execution for count
    # Note: Using subquery approach is safer for complex wheres
    # Simplified: select(func.count()).select_from(Event).where(...)
    
    # Re-constructing count query cleanly:
    count_stmt = select(func.count()).select_from(Event)
    if city:
        count_stmt = count_stmt.where(Event.venue_name.ilike(f"%{city}%"))
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
