from datetime import date
from uuid import UUID
from app.api.access_control import require_production_unlock

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.facility import Facility
from app.schemas.facility import FacilityCreate, FacilityOut
from app.api.admin_auth import require_roles

router = APIRouter(prefix="/facilities", tags=["Facilities"])


def compute_status(expiry_date: date) -> str:
    today = date.today()
    days_left = (expiry_date - today).days

    if days_left < 0:
        return "Expired"
    elif days_left <= 90:
        return "Expiring Soon"
    return "Active"


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_production_unlock)],
)
def create_facility(
    payload: FacilityCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles("admin_manager", "data_officer")),
):
    existing = db.query(Facility).filter(
        Facility.license_number == payload.license_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Facility license number already exists",
        )

    facility = Facility(
        facility_name=payload.facility_name,
        facility_type=payload.facility_type,
        lga=payload.lga,
        address=payload.address,
        license_number=payload.license_number,
        license_issue_date=payload.license_issue_date,
        license_expiry_date=payload.license_expiry_date,
        status=compute_status(payload.license_expiry_date),
    )

    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.get("/", response_model=list[FacilityOut])
def list_facilities(
    lga: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Facility)

    if lga:
        query = query.filter(Facility.lga.ilike(f"%{lga}%"))

    facilities = query.order_by(Facility.created_at.desc()).all()
    return facilities


@router.get("/{facility_id}", response_model=FacilityOut)
def get_facility(facility_id: UUID, db: Session = Depends(get_db)):
    facility = db.query(Facility).filter(Facility.id == facility_id).first()

    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    return facility


@router.get("/lgas")
def get_lgas(db: Session = Depends(get_db)):
    lgas = db.query(Facility.lga).distinct().all()
    return [item[0] for item in lgas if item[0]]



@router.get("/")
def get_facilities():
    return [
        {
            "id": 1,
            "name": "Central Hospital",
            "status": "Active"
        },
        {
            "id": 2,
            "name": "Community Clinic",
            "status": "Pending"
        }
    ]