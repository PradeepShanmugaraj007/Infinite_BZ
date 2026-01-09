import asyncio
import sys
import os

# 1. Force proper event loop for Windows + Playwright
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# Setup DB connection locally since we are not in the app
DATABASE_URL = "postgresql+asyncpg://postgres:Sankar%40722001@localhost:5432/infinitetechai"
engine = create_async_engine(DATABASE_URL)

async def force_scrape():
    print("STARTING FORCE SCRAPE...")
    
    # Import scraper here to ensure loop policy is active first
    from app.services.scraper import scrape_events_playwright
    from app.models.schemas import Event

    try:
        # A. SCRAPE
        print("Scraping Eventbrite (bypass server)...")
        events_data = await scrape_events_playwright("chennai")
        print(f"SCRAPE COMPLETE. Found {len(events_data)} events.")

        # B. SAVE TO DB
        print("Saving to Database...")
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            count = 0
            for data in events_data:
                # Check duplicate
                stmt = select(Event).where(Event.eventbrite_id == data["eventbrite_id"])
                res = await session.execute(stmt)
                existing_event = res.scalars().first()
                if existing_event:
                    # UPDATE EXISTING
                    print(f"Updating {data['title']}...")
                    existing_event.venue_address = data.get("venue_address")
                    existing_event.organizer_name = data.get("organizer_name")
                    existing_event.venue_name = data.get("venue_name")
                    existing_event.image_url = data.get("image_url") # Ensure image is current
                    existing_event.is_free = data.get("is_free")
                    existing_event.online_event = data.get("online_event")
                    session.add(existing_event) # Mark as dirty
                    count += 1
                else:
                    # INSERT NEW
                    session.add(Event(**data))
                    count += 1
            await session.commit()
            print(f"SUCCESS! Added {count} new events to database.")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(force_scrape())
