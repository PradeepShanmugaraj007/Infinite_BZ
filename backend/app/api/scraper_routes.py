
from fastapi import APIRouter, BackgroundTasks
from app.services.event_manager import run_full_scrape_cycle

router = APIRouter()

@router.post("/refresh-events")
async def trigger_refresh():
    """
    Triggers the multi-source scraper in a separate process to avoid loop issues on Windows.
    """
    import subprocess
    import sys
    import os
    
    # Path to the virtualenv python
    python_exe = sys.executable
    worker_script = os.path.join(os.getcwd(), "scraper_worker.py")
    log_file = os.path.join(os.getcwd(), "scraper.log")
    
    # Pass current environment + PYTHONPATH to ensure imports work
    env = os.environ.copy()
    env["PYTHONPATH"] = os.getcwd()

    # Spawn subprocess letting it inherit stdout/stderr (so logs show in Render Dashboard)
    subprocess.Popen(
        [python_exe, worker_script], 
        # stdout=None, stderr=None,  <-- Default behavior is inheritance, which is what we want for logs
        creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0,
        env=env
    )
    
    print(f"API: Triggered background scraper via {worker_script}")
    
    return {
        "status": "accepted",
        "message": "Scraping started in a background process. Refresh the page in a minute."
    }
