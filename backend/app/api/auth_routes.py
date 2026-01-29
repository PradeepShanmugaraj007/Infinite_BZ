from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.schemas import User, UserCreate, UserRead, Token, GoogleToken
from app.auth import get_current_user
from app.services.auth_service import AuthService

# Forgot Password DTOs
from pydantic import BaseModel, EmailStr
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_auth_service(session: AsyncSession = Depends(get_session)) -> AuthService:
    return AuthService(session)

@router.post("/register", response_model=UserRead)
async def register(user: UserCreate, service: AuthService = Depends(get_auth_service)):
    return await service.register_user(user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), service: AuthService = Depends(get_auth_service)):
    # OAuth2 specifies 'username' as the field for email
    return await service.login_user(form_data.username, form_data.password)

@router.post("/google", response_model=Token)
async def google_login(token_data: GoogleToken, service: AuthService = Depends(get_auth_service)):
    return await service.google_login(token_data)

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, service: AuthService = Depends(get_auth_service)):
    return await service.forgot_password_request(request.email)

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    return await service.reset_password(request.email, request.otp, request.new_password)
