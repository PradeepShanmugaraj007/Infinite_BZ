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
    category: Optional[str] = Field(default="Business", index=True)
    
    # New Fields
    capacity: Optional[int] = None
    registration_deadline: Optional[datetime] = None
    meeting_link: Optional[str] = None
    meeting_link_private: bool = Field(default=True)
    timezone: Optional[str] = "UTC"
    
    # --- NEW: The JSON Dump Column ---
    # This uses PostgreSQL's JSONB type for efficient storage
    raw_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB))
    
    created_at: datetime = Field(default_factory=datetime.now)

class EventCreate(SQLModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = "Business"
    is_free: bool = True
    online_event: bool = False
    
    # New Fields
    capacity: Optional[int] = None
    registration_deadline: Optional[datetime] = None
    meeting_link: Optional[str] = None
    meeting_link_private: bool = True
    timezone: Optional[str] = "UTC"
    
    # Pro Fields
    organizer_name: Optional[str] = None
    organizer_email: Optional[str] = None
    price: Optional[str] = None

class UserRegistration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id")
    user_email: str
    registered_at: datetime = Field(default_factory=datetime.now)
    
    # Auto-Registration Fields
    confirmation_id: Optional[str] = None
    status: str = Field(default="PENDING") # PENDING, SUCCESS, FAILED

# --- User Authentication Models ---

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    is_active: bool = Field(default=True)

    # Profile fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None  # For storing image URL or path

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