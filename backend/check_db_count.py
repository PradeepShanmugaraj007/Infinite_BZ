
import asyncio
from app.core.database import get_session
from app.models.schemas import Event
from sqlalchemy import func, select

async def check_count():
    async for session in get_session():
        result = await session.execute(select(func.count(Event.id)))
        count = result.scalar()
        print(f"Total Events in DB: {count}")
        
        if count > 0:
            # Show the first event to see dates/cities
            stmt = select(Event).limit(1)
            res = await session.execute(stmt)
            evt = res.scalar()
            print(f"Sample Event: {evt.title} on {evt.start_time} in {evt.venue_address}")

if __name__ == "__main__":
    import uvicorn
    # minimal setup to run async
    asyncio.run(check_count())
