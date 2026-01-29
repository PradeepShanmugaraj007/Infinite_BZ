
import requests
import datetime

EVENTBRITE_API_TOKEN = "T6WRADHDNPM5S4VYLFR5"
EVENT_ID = "1756352129499"

def check():
    url = f"https://www.eventbriteapi.com/v3/events/{EVENT_ID}/"
    headers = {"Authorization": f"Bearer {EVENTBRITE_API_TOKEN}"}
    params = {"expand": "venue,ticket_classes,organizer"}
    
    response = requests.get(url, headers=headers, params=params)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Title: {data.get('name', {}).get('text')}")
        print(f"Start: {data.get('start')}")
        print(f"End: {data.get('end')}")
        print(f"URL: {data.get('url')}")
        print(f"Series ID: {data.get('series_id')}")
        print(f"Recurrence: {data.get('recurrence')}")
        print(f"Ticket Classes: {data.get('ticket_classes')}")
    else:
        print(response.text)

if __name__ == "__main__":
    check()
