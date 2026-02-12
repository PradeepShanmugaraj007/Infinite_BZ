import sys
import asyncio
import uvicorn

import os

if __name__ == "__main__":
    # Force Proactor Loop for Playwright on Windows
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        print("Windows Proactor Loop Policy Applied.")

    port = int(os.getenv("PORT", 8001))
    print(f"Starting Server with Custom Runner (NO RELOAD - REQUIRED FOR PLAYWRIGHT ON WINDOWS)... Listening on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
