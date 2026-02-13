# Use official Python 3.11 slim image
FROM python:3.11-slim-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies required for Playwright
# These are the full dependencies for Chromium on Debian Bookworm
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo-gobject2 \
    fonts-liberation \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (Chromium only)
# We install with --with-deps just in case any system deps were missed, 
# though apt-get above should cover most.
RUN playwright install --with-deps chromium

# Copy the backend code into the container
COPY backend/ .

# Expose the port the app runs on
ENV PORT=8000
EXPOSE 8000

# Command to run the application
# Using fastAPI via python run.py or direct uvicorn
CMD ["python", "run.py"]
