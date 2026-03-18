from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.core.database import get_db
from app.models.facility import Facility
from app.models.personnel import Personnel
from app.api.admin_auth import require_roles

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def dashboard_overview(
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles("admin_manager", "data_officer")),
):
    today = date.today()
    next_30_days = today + timedelta(days=30)

    facilities = db.query(Facility).all()
    personnel = db.query(Personnel).all()

    expired_facilities = [
        f for f in facilities
        if f.license_expiry_date and f.license_expiry_date < today
    ]

    expiring_facilities = [
        f for f in facilities
        if f.license_expiry_date and today <= f.license_expiry_date <= next_30_days
    ]

    active_facilities = [
        f for f in facilities
        if f.license_expiry_date and f.license_expiry_date > next_30_days
    ]

    expired_personnel = [
        p for p in personnel
        if p.license_expiry_date and p.license_expiry_date < today
    ]

    expiring_personnel = [
        p for p in personnel
        if p.license_expiry_date and today <= p.license_expiry_date <= next_30_days
    ]

    active_personnel = [
        p for p in personnel
        if p.license_expiry_date and p.license_expiry_date > next_30_days
    ]

    return {
        "summary": {
            "total_facilities": len(facilities),
            "active_facilities": len(active_facilities),
            "expired_facilities": len(expired_facilities),
            "expiring_facilities": len(expiring_facilities),
            "total_personnel": len(personnel),
            "active_personnel": len(active_personnel),
            "expired_personnel": len(expired_personnel),
            "expiring_personnel": len(expiring_personnel),
        },
        "all_facilities": [
            {
                "id": str(f.id),
                "facility_name": f.facility_name,
                "facility_type": f.facility_type,
                "lga": f.lga,
                "address": f.address,
                "license_number": f.license_number,
                "license_issue_date": str(f.license_issue_date) if f.license_issue_date else None,
                "license_expiry_date": str(f.license_expiry_date) if f.license_expiry_date else None,
                "status": f.status,
            }
            for f in facilities
        ],
        "all_personnel": [
            {
                "id": str(p.id),
                "full_name": p.full_name,
                "profession": p.profession,
                "license_number": p.license_number,
                "regulatory_body": p.regulatory_body,
                "facility_id": str(p.facility_id) if p.facility_id else None,
                "license_expiry_date": str(p.license_expiry_date) if p.license_expiry_date else None,
                "status": p.status,
            }
            for p in personnel
        ],
        "expired_facilities": [
            {
                "id": str(f.id),
                "facility_name": f.facility_name,
                "facility_type": f.facility_type,
                "lga": f.lga,
                "license_number": f.license_number,
                "license_expiry_date": str(f.license_expiry_date) if f.license_expiry_date else None,
                "status": f.status,
            }
            for f in expired_facilities
        ],
        "expiring_facilities": [
            {
                "id": str(f.id),
                "facility_name": f.facility_name,
                "facility_type": f.facility_type,
                "lga": f.lga,
                "license_number": f.license_number,
                "license_expiry_date": str(f.license_expiry_date) if f.license_expiry_date else None,
                "status": f.status,
            }
            for f in expiring_facilities
        ],
        "expired_personnel": [
            {
                "id": str(p.id),
                "full_name": p.full_name,
                "profession": p.profession,
                "license_number": p.license_number,
                "license_expiry_date": str(p.license_expiry_date) if p.license_expiry_date else None,
                "status": p.status,
            }
            for p in expired_personnel
        ],
        "expiring_personnel": [
            {
                "id": str(p.id),
                "full_name": p.full_name,
                "profession": p.profession,
                "license_number": p.license_number,
                "license_expiry_date": str(p.license_expiry_date) if p.license_expiry_date else None,
                "status": p.status,
            }
            for p in expiring_personnel
        ],
    }