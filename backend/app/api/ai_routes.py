from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.ai_generator import ai_service

router = APIRouter()

class GenerateEventRequest(BaseModel):
    title: str
    category: str = "Business"

@router.post("/generate-event")
async def generate_event(request: GenerateEventRequest):
    """
    Generates event details (description, agenda, tags, image) using AI.
    """
    try:
        # 1. Generate Content
        content = await ai_service.generate_event_content(request.title, request.category)
        
        # 2. Generate Image URL (using Unsplash source for zero-config)
        # We take the first keyword, formatted for URL
        keywords = content.get("image_keywords", ["event"])
        primary_keyword = keywords[0].replace(" ", ",") if keywords else "event"
        
        # Construct a source.unsplash URL which redirects to a random image matching keywords
        image_url = f"https://source.unsplash.com/1600x900/?{primary_keyword}"
        
        return {
            "description": content["description"],
            "agenda": content["agenda"],
            "tags": content["tags"],
            "imageUrl": image_url,
            "image_keywords": keywords
        }

    except Exception as e:
        print(f"AI Generation Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
