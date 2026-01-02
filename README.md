# Infinite BZ - Tech Meetup Aggregator

Welcome to the Infinite BZ project! This guide will help you set up and run the application locally.

## Prerequisites

Ensure you have the following installed on your machine:
*   **Python 3.10+** (Active Python release)
*   **Node.js 18+** (LTS recommended)
*   **Git**
*   **PostgreSQL** (Ensure the service is running and you have a database url)

---

## 🚀 Backend Setup (Python/FastAPI)

The backend is located in the `backend/` directory.

### 1. Navigate to the Backend Directory
```bash
cd backend
```

### 2. Create and Activate a Virtual Environment
It is recommended to use a virtual environment to manage dependencies.

**Windows (Git Bash):**
```bash
python -m venv venv
source venv/Scripts/activate
```
**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file inside the `backend/` folder (or ask the lead for the file).
It should contain:

```ini
# Database Connection
DATABASE_URL=postgresql+asyncpg://postgres:YourPassword@localhost:5432/events_hub
# (Replace 'YourPassword' with your local DB password)

# Email Service (For Forgot Password)
MAIL_USERNAME=infinite.bz.support@gmail.com
MAIL_PASSWORD=your_app_password_here
```

### 5. Run the Server
```bash
python run.py
```
*   The backend will start at: `http://localhost:8000`
*   API Documentation (Swagger): `http://localhost:8000/docs`

---

## 🎨 Frontend Setup (React/Vite)

The frontend is located in the `frontend/` directory.

### 1. Navigate to the Frontend Directory
Open a **new terminal** window/tab and run:
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
*   The frontend will start at: `http://localhost:5174` (or similar port)

---

## 🛠️ Common Issues

### "Address already in use" (Port 8000)
If you see this error when starting the backend, it means a previous python process is still running.
**Fix:**
```bash
# Git Bash:
taskkill //F //IM python.exe

# CMD/PowerShell:
taskkill /F /IM python.exe
```
Then try running `python run.py` again.

### "Connection Refused" (Frontend)
If the frontend shows a blank screen or cannot fetch events, ensure the **Backend is running** in a separate terminal window.

---
**Happy Coding!**
