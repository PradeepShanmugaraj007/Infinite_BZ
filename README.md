# InfiniteBZ - Community Event Platform

**InfiniteBZ** is a hyperlocal event aggregation and management platform designed to connect the tech and startup community in Chennai. It scrapes events from multiple sources (Meetup, Eventbrite) and provides a seamless unified registration experience.

---

## 🚀 Features

*   **Event Aggregation**: Automatically scrapes and aggregates events from Meetup and Eventbrite.
*   **Unified Ticketing**: Create Free, Paid, or VIP tickets with capacity management.
*   **Smart AI Chatbot**: A context-aware assistant powered by **Groq (Llama 3)** to help users find events using natural language.
*   **PDF Ticket Generation**: Auto-generates professional PDF tickets with QR codes.
*   **Email Notifications**: Automated confirmation emails with ticket attachments.
*   **Interactive Dashboard**: Analytics for organizers to track views and registrations.
*   **Secure Authentication**: JWT-based login/signup system.

---

## �️ Tech Stack

### Backend
*   **Framework**: Python (FastAPI)
*   **Database**: PostgreSQL (AsyncPG + SQLModel)
*   **AI/LLM**: LangChain + Groq (Llama 3)
*   **Scraping**: Playwright
*   **Tasks**: APScheduler (Background jobs)

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Vanilla CSS / Tailwind (if configured)
*   **State**: React Hooks

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1.  **Python 3.10+**
2.  **Node.js 18+**
3.  **PostgreSQL Database** (Running locally or hosted)

---

## ⚙️ Configuration (.env)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Connection (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/infinite_bz

# AI Chatbot (Groq API needed for Llama 3)
GROQ_API_KEY=your_groq_api_key_here

# Email Settings (Gmail SMTP)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com

# Security (JWT)
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🏗️ Installation & Setup

### 1. Backend Setup

Open a terminal and run:

```bash
cd backend

# Create Virtual Environment
python -m venv venv

# Activate Virtual Environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Install Playwright Browsers
playwright install

# Initialize Database
# The application automatically creates tables on startup if they don't exist.
```

### 2. Frontend Setup

Open a new terminal and run:

```bash
cd frontend

# Install Dependencies
npm install
```

---

## ▶️ Running the Application

You need to run both the backend and frontend terminals simultaneously.

### Terminal 1: Backend Server

```bash
cd backend
# Ensure venv is activated
python run.py
```
*   **Server URL**: `http://localhost:8000`
*   **API Docs**: `http://localhost:8000/docs`

### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```
*   **Local App URL**: `http://localhost:5174` (or similar)

---

## 🤖 Using the AI Chatbot

1.  Ensure `GROQ_API_KEY` is set in `backend/.env`.
2.  Start the backend server.
3.  Open the frontend application.
4.  Look for the **Chat Widget** (usually bottom-right).
5.  Ask questions like:
    *   *"Show me tech events in Chennai this weekend"*
    *   *"Are there any Python meetups?"*

The chatbot queries the live database to provide accurate, context-aware answers.

---

## 🐞 Troubleshooting

*   **Database Errors**: Ensure PostgreSQL is running and the `DATABASE_URL` is correct.
*   **Browser/Playwright Errors**: If scraping fails, try running `playwright install` again.
*   **Registration Failed**: If you see "Could not validate credentials", try logging out and logging back in.
