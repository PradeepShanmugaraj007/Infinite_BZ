import asyncio
import asyncpg

async def list_databases():
    # We connect to the default 'postgres' database to look around
    # Note: We are using port 5432.
    conn_str = "postgresql://python_user:55555@localhost:5432/postgres"
    
    try:
        conn = await asyncpg.connect(conn_str)
        print("✅ SUCCESS: Connected to Server on Port 5432!")
        
        # Ask the server what databases it has
        rows = await conn.fetch("SELECT datname FROM pg_database;")
        
        print("\n--- DATABASES FOUND ON THIS SERVER ---")
        found = False
        for row in rows:
            print(f"- {row['datname']}")
            if row['datname'] == 'event_hub_db':
                found = True
        
        print("--------------------------------------")
        
        if found:
            print("🎉 'event_hub_db' WAS FOUND! (The issue is likely a typo in your main code)")
        else:
            print("❌ 'event_hub_db' was NOT found. You are connecting to the wrong server instance.")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ CONNECTION FAILED: {e}")

# Run the test
asyncio.run(list_databases())