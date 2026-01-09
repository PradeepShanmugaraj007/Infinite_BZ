import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import text

DATABASE_URL = "postgresql+asyncpg://postgres:Sankar%40722001@localhost:5432/infinitetechai"

async def check():
    print(f"Testing connection to: {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("✅ Database Connected Successfully!")
    except Exception as e:
        print(f"DATABASE CONNECTION ERROR: {e}")
        print("\nPlease ensure PostgreSQL is running and credentials are correct.")

if __name__ == "__main__":
    asyncio.run(check())
