from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import Event

async def delete_expired_events(session: AsyncSession):
    """
    Deletes events where event_date < current_time
    """
    now = datetime.now()
    statement = select(Event).where(Event.event_date < now)
    
    # FIXED: Use .execute() and .scalars()
    result = await session.execute(statement)
    expired_events = result.scalars().all()
    
    count = 0
    for event in expired_events:
        await session.delete(event)
        count += 1
    
    await session.commit()
    return count