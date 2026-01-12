import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, inspect

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to the one we know worked/is configured if .env missing
    DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/infinite_bz"

# Ensure asyncpg
if DATABASE_URL and not DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

async def inspect_table():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.connect() as conn:
        print(f"Connected to: {DATABASE_URL}")
        try:
             # Basic query to check table exists and get 1 row
            result = await conn.execute(text("SELECT * FROM \"user\" LIMIT 1"))
            print("Successfully queried 'user' table.")
            print("Columns found in 'user' table:")
            columns = sorted(list(result.keys()))
            for col in columns:
                print(f" - {col}")
        except Exception as e:
            print(f"Error querying 'user' table: {e}")

    await engine.dispose()

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(inspect_table())
