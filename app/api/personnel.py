from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.admin_auth import require_roles
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.facility import Facility
from app.models.personnel import Personnel
from app.schemas.personnel import PersonnelCreate, PersonnelOut

router = APIRouter()


def compute_status(expiry_date: date) -> str:
    today = date.today()
    days_left = (expiry_date - today).days

    if days_left < 0:
        return "Expired"
    if days_left <= 90:
        return "Expiring Soon"
    return "Active"


@router.post("/", response_model=PersonnelOut, status_code=status.HTTP_201_CREATED)
def create_personnel(
    payload: PersonnelCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles("admin_manager", "data_officer")),
):
    facility = None
    if payload.facility_id:
        facility = db.query(Facility).filter(Facility.id == payload.facility_id).first()
        if not facility:
            raise HTTPException(status_code=404, detail="Facility not found")

    existing_license = (
        db.query(Personnel)
        .filter(Personnel.license_number == payload.license_number)
        .first()
    )
    if existing_license:
        raise HTTPException(status_code=400, detail="License number already exists")

    if payload.email:
        existing_email = db.query(Personnel).filter(Personnel.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = get_password_hash(payload.password) if payload.password else None

    person = Personnel(
        full_name=payload.full_name,
        profession=payload.profession,
        license_number=payload.license_number,
        regulatory_body=payload.regulatory_body,
        facility_id=payload.facility_id,
        email=payload.email,
        hashed_password=hashed_password,
        license_expiry_date=payload.license_expiry_date,
        status=compute_status(payload.license_expiry_date),
        is_active=True,
    )

    db.add(person)
    db.commit()
    db.refresh(person)

    return PersonnelOut(
        id=person.id,
        full_name=person.full_name,
        profession=person.profession,
        license_number=person.license_number,
        regulatory_body=person.regulatory_body,
        facility_id=person.facility_id,
        facility_name=facility.facility_name if facility else None,
        lga=facility.lga if facility else None,
        email=person.email,
        license_expiry_date=person.license_expiry_date,
        status=person.status,
        is_active=person.is_active,
        created_at=person.created_at,
    )


@router.get("/", response_model=list[PersonnelOut])
def list_personnel(db: Session = Depends(get_db)):
    records = (
        db.query(Personnel)
        .options(joinedload(Personnel.facility))
        .all()
    )

    return [
        PersonnelOut(
            id=item.id,
            full_name=item.full_name,
            profession=item.profession,
            license_number=item.license_number,
            regulatory_body=item.regulatory_body,
            facility_id=item.facility_id,
            facility_name=item.facility.facility_name if item.facility else None,
            lga=item.facility.lga if item.facility else None,
            email=item.email,
            license_expiry_date=item.license_expiry_date,
            status=item.status,
            is_active=item.is_active,
            created_at=item.created_at,
        )
        for item in records
    ]