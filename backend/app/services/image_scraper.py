import aiohttp
import urllib.parse
from bs4 import BeautifulSoup
import re

class DuckDuckGoImageScraper:
    def __init__(self):
        self.base_url = "https://html.duckduckgo.com/html/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def get_image_url(self, event_title: str) -> str:
        """
        Searches DDG HTML for '{title} image without text on it with full hd' and extracts the first valid image URL.
        """
        # Formulate query as requested by user
        query = f"{event_title} image without text on it with full hd"
        print(f"DEBUG ImageScraper: Searching DDG for: '{query}'")
        
        url = f"{self.base_url}?q={urllib.parse.quote(query)}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=10) as response:
                    if response.status != 200:
                        print(f"DEBUG ImageScraper: Failed to fetch DDG, status {response.status}")
                        return ""
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, "html.parser")
                    
                    # In DDG HTML, image links are often routed through their proxy
                    # Example: <a class="imageElement" href="...&vqd=..."><img src="//external-content.duckduckgo.com/iu/?u=REAL_URL&f=1" /></a>
                    
                    images = soup.find_all("img", class_="zcm-wrap-img") # Or try finding all imgs in external-content
                    if not images:
                         # Fallback for basic HTML page structure
                         images = soup.find_all("img")
                    
                    for img in images:
                        src = img.get("src", "")
                        
                        # DuckDuckGo proxies image results through external-content
                        if "external-content.duckduckgo.com" in src:
                            src = "https:" + src if src.startswith("//") else src
                            # Extract the *actual* original URL if we want, or just use the proxied one.
                            # The proxied one is actually better because it prevents CORS/hotlinking issues!
                            return src
                        
                        # Standard image fallback (skip icons and tracking pixels)
                        elif src.startswith("http") and not any(x in src.lower() for x in ['logo', 'icon', 'tracker', 'pixel']):
                             return src

            print("DEBUG ImageScraper: No suitable image found in the DDG results.")
            return ""
            
        except Exception as e:
            print(f"DEBUG ImageScraper: Error during DDG scrape: {e}")
            return ""

# Expose a singleton instance
image_scraper_service = DuckDuckGoImageScraper()
