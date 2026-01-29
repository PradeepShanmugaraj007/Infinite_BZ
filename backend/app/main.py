import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel

# Imports from your project
from app.core.database import init_db, engine
from app.api.routes import router
from app.api.auth_routes import router as auth_router
from app.api.admin_routes import router as admin_router
from app.models.schemas import Event
from app.services.scraper import scrape_and_process_events 

# --- THE BACKGROUND TASK ---
async def scheduled_scraper_task():
    """
    Runs automatically to scrape IDs and fetch API details.
    """
    print("DAILY SCHEDULE: Starting automatic hybrid scraper...")
    city = "chennai" 
    
    # 1. Run the Hybrid Scraper
    try:
        from app.services.scraper import scrape_events_playwright
        events_data = await scrape_events_playwright(city)
        print(f"Scraper finished. Found {len(events_data)} potential events.")
    except Exception as e:
        print(f"Scraper failed: {e}")
        return

    # 2. Save to Database
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        added_count = 0
        updated_count = 0
        for data in events_data:
            # Check duplicates using 'eventbrite_id'
            statement = select(Event).where(Event.eventbrite_id == data["eventbrite_id"])
            result = await session.execute(statement)
            existing_event = result.scalars().first()
            
            if not existing_event:
                event = Event(**data)
                session.add(event)
                added_count += 1
            else:
                # Update existing event with fresh data from API
                existing_event.title = data['title']
                existing_event.description = data['description']
                existing_event.start_time = data['start_time']
                existing_event.end_time = data['end_time']
                existing_event.is_free = data['is_free']
                existing_event.venue_name = data['venue_name']
                existing_event.url = data['url']
                existing_event.image_url = data['image_url']
                updated_count += 1
        
        await session.commit()
        print(f"Database Update: Saved {added_count} new events. Updated {updated_count} existing events.")

async def scheduled_cleanup_task():
    """
    Runs automatically to delete expired events.
    """
    print("DAILY SCHEDULE: Starting expired event cleanup...")
    from app.services.cleanup import delete_expired_events
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        try:
            deleted_count = await delete_expired_events(session)
            print(f"Cleanup finished. Deleted {deleted_count} expired events.")
        except Exception as e:
            print(f"Cleanup failed: {e}")

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Create DB Tables
    await init_db()
    
    # 2. Startup: Initialize Scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(scheduled_scraper_task, 'cron', hour=8, minute=0)
    scheduler.add_job(scheduled_cleanup_task, 'cron', hour=2, minute=0) # Keep as backup
    scheduler.start()
    print("Scheduler started! Will scrape every day at 8:00 AM.")
    
    # 3. Startup: Run Cleanup Immediately (Since laptop might be off at 2 AM)
    print("STARTUP: Running initial cleanup...")
    asyncio.create_task(scheduled_cleanup_task())
    
    yield
    
    # 3. Shutdown
    scheduler.shutdown()

app = FastAPI(title="Infinite BZ API", lifespan=lifespan)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"REQUEST: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"RESPONSE: {response.status_code}")
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Request FAILED: {e}")
        raise e

# --- CRITICAL: ENABLE FRONTEND ACCESS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all frontends (React, Postman, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, DELETE, etc.
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

# Mount uploads directory to serve images
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/scrape")
async def manual_scrape():
    """Manually trigger the scraper in the background."""
    asyncio.create_task(scheduled_scraper_task())
    return {"message": "Scraper triggered in background. Check server logs for progress."}

@app.get("/")
def root():
    return {"message": "Infinite BZ Backend is Running with Hybrid Scraper 🕒"}