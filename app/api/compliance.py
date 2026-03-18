from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.facility import Facility
from app.models.personnel import Personnel
from app.schemas.compliance import ComplianceSummary

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.get("/expired-facilities")
def expired_facilities(db: Session = Depends(get_db)):
    today = date.today()
    return db.query(Facility).filter(Facility.license_expiry_date < today).all()


@router.get("/expiring-facilities")
def expiring_facilities(db: Session = Depends(get_db)):
    today = date.today()
    next_30_days = today + timedelta(days=30)
    return db.query(Facility).filter(
        Facility.license_expiry_date >= today,
        Facility.license_expiry_date <= next_30_days
    ).all()


@router.get("/expired-personnel")
def expired_personnel(db: Session = Depends(get_db)):
    today = date.today()
    return db.query(Personnel).filter(Personnel.license_expiry_date < today).all()


@router.get("/expiring-personnel")
def expiring_personnel(db: Session = Depends(get_db)):
    today = date.today()
    next_30_days = today + timedelta(days=30)
    return db.query(Personnel).filter(
        Personnel.license_expiry_date >= today,
        Personnel.license_expiry_date <= next_30_days
    ).all()


@router.get("/summary", response_model=ComplianceSummary)
def compliance_summary(db: Session = Depends(get_db)):
    today = date.today()
    next_30_days = today + timedelta(days=30)

    total_facilities = db.query(Facility).count()
    active_facilities = db.query(Facility).filter(Facility.license_expiry_date > next_30_days).count()
    expiring_facilities = db.query(Facility).filter(
        Facility.license_expiry_date >= today,
        Facility.license_expiry_date <= next_30_days
    ).count()
    expired_facilities = db.query(Facility).filter(Facility.license_expiry_date < today).count()

    total_personnel = db.query(Personnel).count()
    active_personnel = db.query(Personnel).filter(Personnel.license_expiry_date > next_30_days).count()
    expiring_personnel = db.query(Personnel).filter(
        Personnel.license_expiry_date >= today,
        Personnel.license_expiry_date <= next_30_days
    ).count()
    expired_personnel = db.query(Personnel).filter(Personnel.license_expiry_date < today).count()

    return ComplianceSummary(
        total_facilities=total_facilities,
        active_facilities=active_facilities,
        expiring_facilities=expiring_facilities,
        expired_facilities=expired_facilities,
        total_personnel=total_personnel,
        active_personnel=active_personnel,
        expiring_personnel=expiring_personnel,
        expired_personnel=expired_personnel,
    )
@router.get("/alerts")
def compliance_alerts(db: Session = Depends(get_db)):
    today = date.today()
    next_30_days = today + timedelta(days=30)

    expired_facilities = db.query(Facility).filter(
        Facility.license_expiry_date < today
    ).all()

    expiring_facilities = db.query(Facility).filter(
        Facility.license_expiry_date >= today,
        Facility.license_expiry_date <= next_30_days
    ).all()

    expired_personnel = db.query(Personnel).filter(
        Personnel.license_expiry_date < today
    ).all()

    expiring_personnel = db.query(Personnel).filter(
        Personnel.license_expiry_date >= today,
        Personnel.license_expiry_date <= next_30_days
    ).all()

    return {
        "expired_facilities": expired_facilities,
        "expiring_facilities": expiring_facilities,
        "expired_personnel": expired_personnel,
        "expiring_personnel": expiring_personnel
    }