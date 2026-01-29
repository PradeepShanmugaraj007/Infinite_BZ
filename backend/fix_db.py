import asyncio
import asyncpg

async def create_database():
    # We connect to the default 'postgres' database on Port 5432
    # We use 'python_user' and '55555' since your debug script proved they work!
    conn_str = "postgresql://python_user:55555@localhost:5432/postgres"
    
    try:
        print("🔌 Connecting to Port 5432...")
        conn = await asyncpg.connect(conn_str)
        
        # Create the database
        print("🔨 Creating 'event_hub_db'...")
        try:
            await conn.execute('CREATE DATABASE event_hub_db;')
            print("✅ SUCCESS: Database created! You are ready to go.")
        except asyncpg.DuplicateDatabaseError:
            print("⚠️ Database already exists (That's okay too!)")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Tip: If this says 'permission denied', reply and I will give you the admin code.")

# Run the fix
if __name__ == "__main__":
    asyncio.run(create_database())