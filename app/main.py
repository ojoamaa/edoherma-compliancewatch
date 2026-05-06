from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api import (
    admin_auth,
    compliance,
    dashboard,
    dev,
    facilities,
    health,
    personnel,
    personnel_auth,
    reminder,
)
from app.core.database import Base, SessionLocal, engine
from app.core.init_admin import create_default_admin
from app.core.config import settings

import app.models  # noqa: F401


app = FastAPI(
    title="EdoHERMA ComplianceWatch",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://edoherma-compliancewatch.vercel.app",
    ],
    allow_origin_regex=r"https://edoherma-compliancewatch-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()
try:
    create_default_admin(db)
finally:
    db.close()

app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(facilities.router, prefix="/api/facilities", tags=["Facilities"])
app.include_router(personnel.router)
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(dev.router, prefix="/api/dev", tags=["Development"])
app.include_router(admin_auth.router, prefix="/api/admin", tags=["Admin Auth"])
app.include_router(personnel_auth.router)
app.include_router(reminder.router)

@app.get("/")
def root():
    return {
        "app": "EdoHERMA ComplianceWatch",
        "environment": "development",
        "message": "Welcome to EdoHERMA ComplianceWatch",
    }