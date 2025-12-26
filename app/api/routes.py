from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_session
from app.models.schemas import Event, UserRegistration
from app.services.scraper import scrape_and_process_events # Updated import

router = APIRouter()

# --- 1. SYNC (Admin Only) ---
@router.post("/sync")
async def sync_events(city: str = "chennai", session: AsyncSession = Depends(get_session)):
    """
    Triggers the Hybrid Scraper (Selenium + API)
    """
    print(f"🚀 Starting Sync for {city}...")
    events_data = scrape_and_process_events(city)
    
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

# --- 2. PUBLIC EVENTS API (For React Frontend) ---
@router.get("/events", response_model=List[Event])
async def list_events(session: AsyncSession = Depends(get_session)):
    """
    Returns all events including the 'raw_data' JSON field.
    Your Frontend will use this to render the rich UI.
    """
    # Sort by start_time so upcoming events show first
    statement = select(Event).order_by(Event.start_time)
    result = await session.execute(statement)
    events = result.scalars().all()
    return events