
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re

def check_html():
    city = "chennai"
    encoded_city = urllib.parse.quote(city)
    # url = f"https://www.eventbrite.com/d/india--{encoded_city}/{category}/"
    url = "https://www.eventbrite.com/e/train-the-trainer-tickets-1756352129499"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    print(f"Fetching {url}...")
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Look for the event ID or title
        # Event ID: 1756352129499
        
        # Check text content for "Train The Trainer"
        # and "Jan 25"
        
        text = soup.get_text()
        if "Train The Trainer" in text:
            print("Found 'Train The Trainer' in text.")
        else:
            print("Did NOT find 'Train The Trainer'.")
            
        if "1756352129499" in resp.text:
            print("Found ID 1756352129499 in HTML.")
        else:
            print("Did NOT find ID in HTML.")

        if "Jan 25" in text:
            print("Found 'Jan 25' in text.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_html()
