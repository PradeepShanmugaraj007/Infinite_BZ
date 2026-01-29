from typing import List, Dict, Any, Optional
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

# Define the expected output structure
class AgendaItem(BaseModel):
    startTime: str = Field(description="Start time in HH:MM format (24h)")
    endTime: str = Field(description="End time in HH:MM format (24h)")
    title: str = Field(description="Title of the session")
    description: str = Field(description="Brief description of the session")

class EventContent(BaseModel):
    description: str = Field(description="A compelling, markdown-formatted event description (2-3 paragraphs)")
    agenda: List[AgendaItem] = Field(description="A suggested agenda with 3-5 items")
    tags: List[str] = Field(description="5 relevant tags for the event")
    image_keywords: List[str] = Field(description="3 visual keywords to search for a cover image (e.g. 'futuristic city', 'conference crowd')")

class AIGeneratorService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("WARNING: GROQ_API_KEY not found in environment variables.")
        
        # Initialize Groq Chat Model
        self.llm = ChatGroq(
            temperature=0.7,
            groq_api_key=self.api_key,
            model_name="llama3-70b-8192"
        )
        
        self.parser = JsonOutputParser(pydantic_object=EventContent)

    async def generate_event_content(self, title: str, category: str) -> Dict[str, Any]:
        """
        Generates description, agenda, and image keywords for an event.
        """
        if not self.api_key:
            raise Exception("GROQ_API_KEY is missing. Please add it to your .env file.")

        # detailed prompt
        system_prompt = """You are an expert event planner and copywriter. 
        Your task is to generate high-quality, engaging content for a new event based on its Title and Category.
        
        1. Write a compelling description in Markdown. make it exciting!
        2. Create a realistic agenda/schedule for a 1-day event.
        3. Generate relevant tags.
        4. Suggest visual keywords for finding a background image.
        
        Respond ONLY in valid JSON matching the specified structure."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "Title: {title}\nCategory: {category}\n\n{format_instructions}")
        ])

        chain = prompt | self.llm | self.parser

        try:
            result = await chain.ainvoke({
                "title": title, 
                "category": category,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            # Post-process to add image URL (Mock for now, or Unsplash search later)
            # For now, we will just return the keywords so the frontend or another service can fetch the image
            return result
            
        except Exception as e:
            print(f"Error generating content: {e}")
            raise e

# Singleton instance
ai_service = AIGeneratorService()
