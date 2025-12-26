from typing import Optional, Dict, Any
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
    is_free: bool = Field(default=True)
    
    # --- NEW: The JSON Dump Column ---
    # This uses PostgreSQL's JSONB type for efficient storage
    raw_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB))
    
    created_at: datetime = Field(default_factory=datetime.now)

class UserRegistration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id")
    user_email: str
    registered_at: datetime = Field(default_factory=datetime.now)