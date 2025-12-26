import os
import re
import requests
import time
from datetime import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv

load_dotenv()
API_TOKEN = os.getenv("EVENTBRITE_TOKEN")

# --- PART 1: THE HIJACKER (Connects to Open Chrome) ---
def get_scraper_driver():
    """
    Connects to the EXISTING Chrome window running on port 9222.
    """
    print("🔌 Connecting to your open Chrome window...")
    chrome_options = Options()
    # This tells Selenium: "Don't open a new window, talk to the one on port 9222"
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def extract_ids_from_search(city: str = "chennai"):
    driver = None
    found_ids = set()
    
    try:
        driver = get_scraper_driver()
        
        # --- UPGRADE 1: FORCE NAVIGATION TO "ALL EVENTS" ---
        # We explicitly go to the URL that shows EVERYTHING (no date filters)
        target_url = f"https://www.eventbrite.com/d/india--{city}/events/"
        
        # Only navigate if we aren't already there to save time
        if target_url not in driver.current_url:
            print(f"🚀 Navigating to ALL EVENTS page: {target_url}")
            driver.get(target_url)
            time.sleep(3) # Give it a second to load
        
        print("⬇️  Starting DEEP SCROLL (20 pages)...")
        
        # --- UPGRADE 2: SCROLL 20 TIMES ---
        # This will load approx 150-200 events
        for i in range(20):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2) # Wait for new cards to appear
            print(f"   PLEASE WAIT... Scrolling {i+1}/20")
        
        # Scrape the HTML from your open window
        soup = BeautifulSoup(driver.page_source, "html.parser")
        links = soup.select("a[href*='/e/']")
        
        for link in links:
            href = link['href']
            match = re.search(r'(\d{10,})', href)
            if match:
                found_ids.add(match.group(1))
                
        print(f"🎯 Found {len(found_ids)} unique Event IDs from your active session.")
        
    except Exception as e:
        print(f"❌ Hijack Error: {e}")
        print("💡 Did you run the chrome.exe command in Step 2?")
    
    # IMPORTANT: Do NOT quit the driver, or it will close your manual window!
    # driver.quit() 
            
    return list(found_ids)

# --- PART 2: THE BRAIN (API Request) ---
def fetch_and_filter_event(event_id: str):
    url = f"https://www.eventbriteapi.com/v3/events/{event_id}/"
    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    params = {
        "expand": "venue,organizer,category,subcategory,format,logo,ticket_availability" 
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            return None
            
        data = response.json()
        
        # --- UPGRADE 3: SHOW SKIPPED EVENTS ---
        if not data.get("is_free"):
            # We print this so you see the script is working, even if it doesn't save
            print(f"💰 Skipping Paid Event: {data.get('name', {}).get('text')[:30]}...") 
            return None 
            
        return {
            "eventbrite_id": event_id,
            "title": data.get("name", {}).get("text"),
            "description": data.get("description", {}).get("text"),
            "start_time": datetime.fromisoformat(data["start"]["local"]),
            "end_time": datetime.fromisoformat(data["end"]["local"]),
            "url": data.get("url"),
            "image_url": data.get("logo", {}).get("url") if data.get("logo") else None,
            "venue_name": data.get("venue", {}).get("name") if data.get("venue") else "Online",
            "is_free": True,
            "raw_data": data 
        }

    except Exception:
        return None

# --- PART 3: THE CONTROLLER ---
def scrape_and_process_events(city: str):
    # 1. Hijack browser to get IDs
    ids = extract_ids_from_search(city)
    clean_events = []
    
    # 2. Use API for details
    print(f"⚡ Processing {len(ids)} IDs via API...")
    for eid in ids:
        time.sleep(0.1) 
        event_data = fetch_and_filter_event(eid)
        if event_data:
            clean_events.append(event_data)
            
    return clean_events