EdoHERMA ComplianceWatch

Compliance monitoring system for facilities and personnel built with FastAPI and React.

---

Overview

EdoHERMA ComplianceWatch helps administrators monitor:

- Registered health facilities
- Licensed personnel
- Expired licenses
- Licenses nearing expiry
- Personnel compliance access

---

Tech Stack

Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Passlib / bcrypt

Frontend

- React (Vite)
- Modern UI styling

---

Project Structure

app/                     # Backend (FastAPI)
edoherrma-frontend/      # Frontend (React)
requirements.txt
run.py

---

Local Setup (Run on your computer)

1. Backend Setup

Open terminal:

cd edoherrma-compliancewatch
venv\Scripts\activate
pip install -r requirements.txt
python run.py

Backend runs on:
http://127.0.0.1:8000

API Docs:
http://127.0.0.1:8000/docs

---

2. Frontend Setup

Open another terminal:

cd edoherrma-compliancewatch\edoherrma-frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

---

Environment Variables

Create a ".env" file in the root folder:

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/edoherrma_db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_NAME=EdoHERMA ComplianceWatch

---

Features

- Admin login & logout
- Personnel login & logout
- Admin dashboard
- Personnel portal
- Compliance monitoring
- Expiry tracking

---

Status

✅ Backend working
✅ Frontend working
✅ Authentication working
🚀 Ready for deployment

---

Author

Abdulmalik Ojoma Abdullahi
