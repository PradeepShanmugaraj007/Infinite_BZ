
import asyncio
from playwright.async_api import async_playwright
import sys

async def run():
    print("Starting Playwright Test...")
    async with async_playwright() as p:
        print("Launching Chromium (headless)...")
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        
        print("Creating Context...")
        context = await browser.new_context()
        page = await context.new_page()

        url = "https://www.eventbrite.com/d/india--chennai/business--events/"
        print(f"Navigating to: {url}")
        
        try:
            await page.goto(url, timeout=60000)
            title = await page.title()
            print(f"Page Title: {title}")
            
            # Take a screenshot to prove rendering works
            await page.screenshot(path="debug_docker_test.png")
            print("Screenshot saved to debug_docker_test.png")
            
            if "Eventbrite" in title or "Events" in title:
                print("SUCCESS: Playwright is working correctly!")
            else:
                print("WARNING: Title doesn't match expected, but browser ran.")
                
        except Exception as e:
            print(f"ERROR: Navigation failed: {e}")
            sys.exit(1)
        finally:
            await browser.close()
            print("Browser closed.")

if __name__ == "__main__":
    asyncio.run(run())
