# InfiniteBZ - Community Event Platform

InfiniteBZ is a comprehensive event management platform tailored for local communities (currently Chennai). It aggregates events from multiple sources (like Eventbrite) and allows users to create and manage their own listing directly on the platform.

## Features

*   **Aggregated Feed**: Automatically scrapes and displays tech and networking events from external sources.
*   **User Events**: detailed "Create Event" wizard for users to host their own meetups.
*   **My Events Dashboard**: A personalized dashboard for organizers to track active events and registrations.
*   **Rich Event Details**: Premium, immersive event detail views with agenda, speakers, and location maps.
*   **Authentication**: Secure JWT-based signup and login system.
*   **Admin Analytics**: Backend stats for track platform growth.

## Tech Stack

### Frontend
*   **React (Vite)**: Fast, modern UI library.
*   **Tailwind CSS**: For a sleek, dark-themed responsive design.
*   **Lucide React**: Beautiful, consistent iconography.

### Backend
*   **FastAPI**: High-performance Python framework.
*   **SQLModel / SQLAlchemy**: Async ORM for Postgres interaction.
*   **PostgreSQL**: Robust relational database.
*   **Playwright**: For advanced web scraping capabilities.
*   **APScheduler**: For background tasks and data synchronization.

## Setup & Run

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   PostgreSQL Database

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv (Windows: .\venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
playwright install
python run.py
```
*   Server runs on `http://localhost:8000`
*   Docs available at `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*   App runs on `http://localhost:5173` (or similar port)

## Project Structure
*   `/backend`: FastAPI application, database models, and scraper logic.
*   `/frontend`: React application, components, and assets.

## License
MIT
