from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.personnel import Personnel

router = APIRouter(prefix="/api/public", tags=["Public Verification"])


@router.get("/verify/{license_number}")
def verify_license(license_number: str, db: Session = Depends(get_db)):
    clean_license = license_number.strip().upper()

    person = (
        db.query(Personnel)
        .options(joinedload(Personnel.facility))
        .filter(Personnel.license_number == clean_license)
        .first()
    )

    if not person:
        raise HTTPException(status_code=404, detail="License record not found")

    return {
        "verified": True,
        "full_name": person.full_name,
        "profession": person.profession,
        "license_number": person.license_number,
        "regulatory_body": person.regulatory_body,
        "license_expiry_date": str(person.license_expiry_date),
        "status": person.status,
        "facility_name": person.facility.facility_name if person.facility else None,
        "lga": person.facility.lga if person.facility else None,
        "message": "License record found in EdoHERMA ComplianceWatch.",
    }