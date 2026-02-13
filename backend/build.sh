#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (Chromium only)
# playwright install chromium # DISABLED: Causes "su: Authentication failure" on Render. Using runtime self-healing instead.
