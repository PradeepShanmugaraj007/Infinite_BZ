import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:Sankar%40722001@localhost:5432/infinitetechai"

async def check_db():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.connect() as conn:
        result_users = await conn.execute(text("SELECT count(*) FROM \"user\""))
        total_users = result_users.scalar()
        print(f"Users Count (SQL): {total_users}")

        result_events = await conn.execute(text("SELECT count(*) FROM event"))
        total_events = result_events.scalar()
        print(f"Events Count (SQL): {total_events}")

if __name__ == "__main__":
    asyncio.run(check_db())
