import asyncio
import os
import random
from typing import List, Optional
from playwright.async_api import async_playwright

class BrowserSearcher:
    """
    Handles browser-based image searching using Playwright.
    Bypasses API blocks by mimicking a real user on DuckDuckGo.
    """
    
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        ]

    async def search_images(self, query: str, max_results: int = 8) -> List[str]:
        """
        Navigates to DuckDuckGo Images and scrapes candidate URLs.
        """
        print(f"BrowserSearcher: Starting search for '{query}'...")
        image_urls = []
        
        async with async_playwright() as p:
            # Check for local playwright browsers path (Render config)
            browser_path = os.getenv("PLAYWRIGHT_BROWSERS_PATH")
            
            try:
                browser = await p.chromium.launch(
                    headless=True,
                    args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                )
                
                context = await browser.new_context(
                    user_agent=random.choice(self.user_agents),
                    viewport={'width': 1280, 'height': 720}
                )
                
                page = await context.new_page()
                
                # Use Stealth pattern from scraper.py
                from playwright_stealth import Stealth
                await Stealth().apply_stealth_async(page)
                
                # Navigate directly to DuckDuckGo Image Search
                url = f"https://duckduckgo.com/?q={query.replace(' ', '+')}&iax=images&ia=images"
                print(f"BrowserSearcher: Navigating to {url}")
                
                await page.goto(url, wait_until="networkidle", timeout=30000)
                
                # Wait for image results to load
                await page.wait_for_selector(".tile--img", timeout=10000)
                
                # Extract image URLs from the JSON metadata in the tiles
                # DuckDuckGo stores the large image URL in a 'data-solve' or similar attribute, 
                # but often the simplest way is to extract it from the 'tile--img__img' src or better, the link.
                
                # We'll use a script to extract the actual high-res URLs from the DDG metadata
                image_urls = await page.evaluate("""
                    () => {
                        const results = [];
                        const tiles = document.querySelectorAll('.tile--img');
                        for (let tile of tiles) {
                            try {
                                const data = JSON.parse(tile.getAttribute('data-zci-link') || '{}');
                                if (data.image) {
                                    results.push(data.image);
                                } else {
                                    // Fallback to finding internal JSON structure if attribute is different
                                    const img = tile.querySelector('img.tile--img__img');
                                    if (img && img.src && !img.src.includes('base64')) {
                                        results.push(img.src);
                                    }
                                }
                            } catch (e) {
                                const img = tile.querySelector('img.tile--img__img');
                                if (img && img.src) results.push(img.src);
                            }
                            if (results.length >= 15) break;
                        }
                        return results;
                    }
                """)
                
                print(f"BrowserSearcher: Found {len(image_urls)} candidate images.")
                await browser.close()
                
            except Exception as e:
                print(f"BrowserSearcher Error: {e}")
                if 'browser' in locals():
                    await browser.close()
                    
        return image_urls[:max_results]

# Singleton instance
browser_searcher = BrowserSearcher()
