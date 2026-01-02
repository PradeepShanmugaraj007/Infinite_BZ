from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB 

class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Unique ID from Eventbrite to prevent duplicates
    eventbrite_id: str = Field(unique=True, index=True) 
    
    # Core fields for fast filtering/sorting
    title: str
    description: Optional[str] = None
    start_time: datetime 
    end_time: Optional[datetime] = None
    
    url: str
    image_url: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    organizer_name: Optional[str] = None
    is_free: bool = Field(default=True)
    online_event: bool = Field(default=False)
    
    # --- NEW: The JSON Dump Column ---
    # This uses PostgreSQL's JSONB type for efficient storage
    raw_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB))
    
    created_at: datetime = Field(default_factory=datetime.now)

class UserRegistration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id")
    user_email: str
    registered_at: datetime = Field(default_factory=datetime.now)

# --- User Authentication Models ---

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    is_active: bool = Field(default=True)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    # Forgot Password Fields
    reset_otp: Optional[str] = None
    otp_expires_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: Optional[str] = None

class GoogleToken(SQLModel):
    token: str

class EventListResponse(SQLModel):
    data: List[Event]
    total: int
    page: int
    limit: int