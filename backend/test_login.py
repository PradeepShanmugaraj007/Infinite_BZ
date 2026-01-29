import asyncio
import os
from dotenv import load_dotenv
from app.services.auth_service import AuthService
from app.core.database import get_session, engine
from app.models.schemas import User
from sqlalchemy.future import select

load_dotenv()

async def test_login():
    try:
        # 1. Grab a valid user from DB
        async for session in get_session():
            print("Checking for existing users...")
            try:
                result = await session.execute(select(User))
                user = result.scalars().first()
            except Exception as e:
                print(f"CRITICAL ERROR during INITIAL user fetch: {e}")
                return

            if not user:
                print("No users found in DB to test login with.")
                return

            print(f"Found user: {user.email}")
            
            # 2. Try to 'login' (we don't know the password, but we can check if the SELECT fails)
            # The login_user function does the select again.
            service = AuthService(session)
            
            print("Attempting to fetch user via auth service logic (simulating part of login)...")
            try:
                # We just want to see if this query crashes
                statement = select(User).where(User.email == user.email)
                res = await session.execute(statement)
                u = res.scalars().first()
                print(f"Fetch successful. User ID: {u.access_token if hasattr(u, 'access_token') else u.id}") # accessing prop
                print(f"OTP fields: {u.reset_otp}, {u.otp_expires_at}")
            except Exception as e:
                print(f"CRITICAL ERROR during user fetch: {e}")
                import traceback
                traceback.print_exc()
            
            break # Exit after one pass
    except Exception as outer_e:
        print(f"Outer loop error: {outer_e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(test_login())
