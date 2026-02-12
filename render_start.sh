#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r backend/requirements.txt

# Install Playwright browsers
playwright install chromium
playwright install-deps chromium

# Run the application
python backend/run.py
