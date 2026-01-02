from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import os
from dotenv import load_dotenv

load_dotenv() # Load variables from .env file

# Configuration: Read from Environment Variables
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", os.getenv("MAIL_USERNAME", ""))
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")

# Check if credentials exist to enable real email
ENABLE_EMAIL = bool(MAIL_USERNAME and MAIL_PASSWORD)

conf = ConnectionConfig(
    MAIL_USERNAME = MAIL_USERNAME,
    MAIL_PASSWORD = MAIL_PASSWORD,
    MAIL_FROM = MAIL_FROM,
    MAIL_PORT = MAIL_PORT,
    MAIL_SERVER = MAIL_SERVER,
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_reset_email(email: EmailStr, otp: str):
    """
    Sends the reset OTP. 
    Uses SMTP if credentials are configured, otherwise falls back to console log.
    """
    if ENABLE_EMAIL:
        print(f"Sending OTP email to {email}...")
        try:
            message = MessageSchema(
                subject="Password Reset Request",
                recipients=[email],
                body=f"Your password reset code is: {otp}",
                subtype="html"
            )
            fm = FastMail(conf)
            await fm.send_message(message)
            print("Email sent successfully.")
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            # Fallback to console log in case of error, so user isn't stuck
            print("="*30)
            print(f" [EMAIL FALLBACK] To: {email}")
            print(f" [EMAIL FALLBACK] OTP: {otp}")
            print("="*30)
            return False
    else:
        # Mock Mode
        print("="*30)
        print(f" [EMAIL MOCK] To: {email}")
        print(f" [EMAIL MOCK] Subject: Password Reset")
        print(f" [EMAIL MOCK] Your OTP is: {otp}")
        print(f" [HINT] Set MAIL_USERNAME and MAIL_PASSWORD env vars to enable real email.")
        print("="*30)
        return True
