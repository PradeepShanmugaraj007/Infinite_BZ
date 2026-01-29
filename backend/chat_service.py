from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.utilities import SQLDatabase
from langchain.chains import create_sql_query_chain
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool
from operator import itemgetter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import os
import re
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_location: str = "Unknown"  # New field
    current_page: str = "Unknown"   # New field

# --- CONFIGURATION ---
database_url = os.getenv("DATABASE_URL")

# FIX: LangChain (SQLAlchemy Sync) cannot use 'asyncpg'. We must use 'psycopg2' (default).
if database_url and "+asyncpg" in database_url:
    database_url = database_url.replace("+asyncpg", "")

if not database_url:
    database_url = "sqlite:///./infinite_bz.db"

# FIX: Explicitly tell it to look at 'event' table to avoid 'events' confusion
db = SQLDatabase.from_uri(database_url, include_tables=['event', 'userregistration'])

llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.3-70b-versatile", 
    api_key=os.getenv("GROQ_API_KEY")
)

# --- CHAIN A: The "Social" Brain (General Chat) ---
system_prompt = """You are the strict AI Event Assistant for 'Infinite BZ'. 
Your identity is tied entirely to this platform. You are NOT a general-purpose AI.

**STRICT SCOPE RULES:**
1. **STRICT DOMAIN:** You only answer questions related to Infinite BZ, Events, Workshops, Tickets, or Navigating the App.
2. **REFUSAL LOGIC:** If a user asks about anything else (medical advice, coding help, general knowledge, history, etc.), you MUST:
   - Politely refuse to answer the specific off-topic question.
   - Immediately steer the conversation back to Infinite BZ or events.
   - Example: "I can't give medical advice, but I can help you find health & wellness workshops in Chennai. Would you like to see those?"
3. **IDENTITY:** Never break character. You are an Event Assistant, not a general knowledge model.
4. **STYLE:** Be concise, helpful, and professional.
"""

general_prompt = PromptTemplate.from_template(
    f"{system_prompt}\nUser Question: {{question}}\nAnswer:"
)
general_chain = general_prompt | llm | StrOutputParser()

# --- CHAIN B: The "Data" Brain (SQL Query) ---
# --- CHAIN B: The "Data" Brain (SQL Query) ---
def clean_sql(text):
    # 1. Try to find markdown block
    if "```sql" in text:
        return text.split("```sql")[1].split("```")[0].strip()
    if "```" in text:
         return text.split("```")[1].split("```")[0].strip()
    
    # 2. Try to find raw SQL using Regex (Look for SELECT ... FROM ...)
    # Case insensitive, DOTALL to match newlines
    match = re.search(r"(SELECT\s.*)", text, re.IGNORECASE | re.DOTALL)
    if match:
        sql = match.group(1).strip()
        print(f"DEBUG SQL: {sql}")
        return sql
        
    print(f"DEBUG SQL (Raw): {text.strip()}")
    return text.strip()

write_query_prompt = PromptTemplate.from_template(
    """You are a PostgreSQL expert. Given an input question, create a syntactically correct PostgreSQL query to run.
    
    Current User Context:
    - User Location: {user_location}
    - Current Page: {current_page}
    
    Rules:
    1. **Location Filtering:** If the user asks for "nearby", "local", or "events near me":
       - You MUST filter by the 'venue_address' column.
       - Do NOT use exact matches (e.g., = 'Saidapet, Chennai'). 
       - Instead, use `ILIKE` with the main city name. 
       - Example: If location is 'Saidapet, Chennai', write: `WHERE venue_address ILIKE '%Chennai%'`.
    
    2. **General Rules:**
       - unless the user specifies a specific number, always limit results to 5 using `LIMIT 5`.
       - Write ONLY the SQL query. No markdown, no explanations.
    
    3. **Schema Info:**
       - **Table Name:** 'event'
       - **Columns:** title, description, start_time, end_time, venue_address, venue_name, is_free.
       - **IMPORTANT:** There is NO 'city' column. Use `venue_address` to filter by location.
       - Example: `WHERE venue_address ILIKE '%Chennai%'`
    
    Question: {question}
    SQL Query:"""
)

# We create a chain that takes ALL inputs (question + location + page)
write_query = write_query_prompt | llm | StrOutputParser() | clean_sql

execute_query = QuerySQLDataBaseTool(db=db)

answer_prompt = PromptTemplate.from_template(
    """Given the following user question, corresponding SQL query, and SQL result, answer the user question directly.
    
    Question: {question}
    SQL Query: {query}
    SQL Result: {result}
    Answer: """
)

# The Complex Chain: Pass location/page down to the query writer
sql_chain = (
    RunnablePassthrough.assign(
        query=write_query 
    ).assign(
        result=itemgetter("query") | execute_query
    )
    | answer_prompt
    | llm
    | StrOutputParser()
)

# --- THE ROUTER: Traffic Control ---
router_prompt = PromptTemplate.from_template(
    """Classify the user question as "DATABASE" or "GENERAL".
    
    - "DATABASE": Specific requests for event data or registrations (e.g., "Any events in Chennai?", "Free tickets?", "My registrations").
    - "GENERAL": Everything else, including greetings, platform questions, and OFF-TOPIC questions that require the AI's refusal logic (e.g., "Hi", "How do I reset my password?", "Tell me a joke", "What is a fever?").
    
    Classification (one word only):"""
)

router_chain = router_prompt | llm | StrOutputParser()

def route_request(info):
    # 'info' contains the classification result from the router_chain
    # Logging for debug
    print(f"Routing Decision: {info['topic']}")
    if "DATABASE" in info["topic"].upper():
        return sql_chain
    else:
        return general_chain

# Combine it all: Router -> Switch -> Execute Chosen Chain
full_chain = (
    RunnablePassthrough.assign(topic=router_chain)
    | RunnableLambda(route_request)
)

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Prepare the full context dictionary
        inputs = {
            "question": request.message,
            "user_location": request.user_location,
            "current_page": request.current_page
        }
        
        # Pass the dictionary to the chain
        response = full_chain.invoke(inputs)
        
        return {
            "reply": response,
            "type": "text"
        }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")
        return {
            "reply": "I encountered an error processing your request.",
            "type": "error"
        }
