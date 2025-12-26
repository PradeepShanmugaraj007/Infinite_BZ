import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware  # <--- NEW IMPORT

# Imports from your project
from app.core.database import init_db, engine
from app.api.routes import router
from app.models.schemas import Event
from app.services.scraper import scrape_and_process_events 

# --- THE BACKGROUND TASK ---
async def scheduled_scraper_task():
    """
    Runs automatically to scrape IDs and fetch API details.
    """
    print("⏰ DAILY SCHEDULE: Starting automatic hybrid scraper...")
    city = "chennai" 
    
    # 1. Run the Hybrid Scraper
    try:
        events_data = scrape_and_process_events(city)
        print(f"✅ Scraper finished. Found {len(events_data)} potential events.")
    except Exception as e:
        print(f"❌ Scraper failed: {e}")
        return

    # 2. Save to Database
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        added_count = 0
        for data in events_data:
            # Check duplicates using 'eventbrite_id'
            statement = select(Event).where(Event.eventbrite_id == data["eventbrite_id"])
            result = await session.execute(statement)
            existing_event = result.scalars().first()
            
            if not existing_event:
                event = Event(**data)
                session.add(event)
                added_count += 1
        
        await session.commit()
        print(f"💾 Database Update: Saved {added_count} new FREE events.")

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Create DB Tables
    await init_db()
    
    # 2. Startup: Initialize Scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(scheduled_scraper_task, 'cron', hour=8, minute=0)
    scheduler.start()
    print("🚀 Scheduler started! Will scrape every day at 8:00 AM.")
    
    yield
    
    # 3. Shutdown
    scheduler.shutdown()

app = FastAPI(title="Unified Event Hub", lifespan=lifespan)

# --- CRITICAL: ENABLE FRONTEND ACCESS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all frontends (React, Postman, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, DELETE, etc.
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Event Hub Backend is Running with Hybrid Scraper 🕒"}