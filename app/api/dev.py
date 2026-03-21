from datetime import date
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.utils import get_license_status
from app.core.security import get_password_hash
from app.models.facility import Facility
from app.models.personnel import Personnel

router = APIRouter(prefix="/dev", tags=["Development"])


@router.post("/seed-demo-data")
def seed_demo_data(db: Session = Depends(get_db)):
    existing_facilities = db.query(Facility).count()
    existing_personnel = db.query(Personnel).count()

    if existing_facilities > 0 or existing_personnel > 0:
        return {
            "message": "Database already has records. Seed skipped.",
            "facilities": existing_facilities,
            "personnel": existing_personnel,
        }

    facilities_data = [
        {
            "facility_name": "GraceVeil Hospital",
            "facility_type": "Hospital",
            "lga": "Egor",
            "address": "45 Sapele Road, Benin City",
            "license_number": "EDO-HOSP-1001",
            "license_issue_date": date(2025, 1, 1),
            "license_expiry_date": date(2026, 12, 31),
        },
        {
            "facility_name": "St Mary Clinic",
            "facility_type": "Clinic",
            "lga": "Oredo",
            "address": "12 Mission Road, Benin City",
            "license_number": "EDO-CLIN-1002",
            "license_issue_date": date(2025, 2, 1),
            "license_expiry_date": date(2026, 3, 25),
        },
        {
            "facility_name": "Hope Diagnostics",
            "facility_type": "Laboratory",
            "lga": "Ikpoba-Okha",
            "address": "Airport Road, Benin City",
            "license_number": "EDO-LAB-1003",
            "license_issue_date": date(2023, 1, 1),
            "license_expiry_date": date(2024, 1, 15),
        },
    ]

    created_facilities = []

    for item in facilities_data:
        facility = Facility(
            id=uuid.uuid4(),
            facility_name=item["facility_name"],
            facility_type=item["facility_type"],
            lga=item["lga"],
            address=item["address"],
            license_number=item["license_number"],
            license_issue_date=item["license_issue_date"],
            license_expiry_date=item["license_expiry_date"],
            status=get_license_status(item["license_expiry_date"]),
        )
        db.add(facility)
        created_facilities.append(facility)

    db.commit()

    for facility in created_facilities:
        db.refresh(facility)

    personnel_data = [
    {
        "full_name": "Dr. Osagie Ehimare",
        "profession": "Doctor",
        "license_number": "MDCN-1001",
        "regulatory_body": "MDCN",
        "facility_id": created_facilities[0].id,
        "license_expiry_date": date(2026, 11, 30),
        "email": "osagie@edoherma.com",
        "password": "Password123!",
        "is_active": True,
    },
    {
        "full_name": "Nurse Grace Asemota",
        "profession": "Nurse",
        "license_number": "NMCN-1002",
        "regulatory_body": "NMCN",
        "facility_id": created_facilities[1].id,
        "license_expiry_date": date(2026, 1, 15),
        "email": "grace@edoherma.com",
        "password": "Password123!",
        "is_active": True,
    },
    {
        "full_name": "Pharm. Bello Ojo",
        "profession": "Pharmacist",
        "license_number": "PCN-1003",
        "regulatory_body": "PCN",
        "facility_id": created_facilities[2].id,
        "license_expiry_date": date(2026, 3, 20),
        "email": "bello@edoherma.com",
        "password": "Password123!",
        "is_active": True,
    },
]

    created_personnel = []

    for item in personnel_data:
        person = Personnel(
    id=uuid.uuid4(),
    full_name=item["full_name"],
    profession=item["profession"],
    license_number=item["license_number"],
    regulatory_body=item["regulatory_body"],
    facility_id=item["facility_id"],
    license_expiry_date=item["license_expiry_date"],
    status=get_license_status(item["license_expiry_date"]),
    email=item["email"],
    hashed_password=get_password_hash(item["password"]),
    is_active=item["is_active"],
)
        db.add(person)
        created_personnel.append(person)

    db.commit()

    return {
        "message": "Demo data seeded successfully",
        "facilities_created": len(created_facilities),
        "personnel_created": len(created_personnel),
    }


@router.post("/seed-extra-demo-data")
def seed_extra_demo_data(db: Session = Depends(get_db)):
    extra_facilities_data = [
        {
            "facility_name": "Edo Central Medical Centre",
            "facility_type": "Hospital",
            "lga": "Uhunmwonde",
            "address": "Main Road, Uhunmwonde",
            "license_number": "EDO-HOSP-2001",
            "license_issue_date": date(2025, 1, 10),
            "license_expiry_date": date(2026, 9, 30),
        },
        {
            "facility_name": "Ovia Family Clinic",
            "facility_type": "Clinic",
            "lga": "Ovia North-East",
            "address": "Market Road, Okada",
            "license_number": "EDO-CLIN-2002",
            "license_issue_date": date(2025, 3, 1),
            "license_expiry_date": date(2026, 8, 15),
        },
        {
            "facility_name": "Sunrise Maternity Centre",
            "facility_type": "Maternity",
            "lga": "Ovia South-West",
            "address": "Sobe Junction",
            "license_number": "EDO-MAT-2003",
            "license_issue_date": date(2025, 4, 12),
            "license_expiry_date": date(2026, 7, 30),
        },
        {
            "facility_name": "Etsako Community Hospital",
            "facility_type": "Hospital",
            "lga": "Etsako West",
            "address": "Auchi Express Road",
            "license_number": "EDO-HOSP-2004",
            "license_issue_date": date(2025, 1, 18),
            "license_expiry_date": date(2026, 10, 20),
        },
        {
            "facility_name": "Esan Specialist Diagnostics",
            "facility_type": "Laboratory",
            "lga": "Esan West",
            "address": "Ekpoma Town Centre",
            "license_number": "EDO-LAB-2005",
            "license_issue_date": date(2025, 5, 9),
            "license_expiry_date": date(2026, 6, 18),
        },
    ]

    facility_map = {}
    facilities_added = 0
    facilities_skipped = 0

    for item in extra_facilities_data:
        existing = db.query(Facility).filter(
            Facility.license_number == item["license_number"]
        ).first()

        if existing:
            facility_map[item["license_number"]] = existing
            facilities_skipped += 1
            continue

        facility = Facility(
            id=uuid.uuid4(),
            facility_name=item["facility_name"],
            facility_type=item["facility_type"],
            lga=item["lga"],
            address=item["address"],
            license_number=item["license_number"],
            license_issue_date=item["license_issue_date"],
            license_expiry_date=item["license_expiry_date"],
            status=get_license_status(item["license_expiry_date"]),
        )
        db.add(facility)
        db.flush()
        facility_map[item["license_number"]] = facility
        facilities_added += 1

    personnel_seed = [
        {
            "full_name": "Dr. Patrick Omoruyi",
            "profession": "Doctor",
            "license_number": "MDCN-2001",
            "regulatory_body": "MDCN",
            "facility_license_number": "EDO-HOSP-2001",
            "license_expiry_date": date(2026, 9, 10),
            "email": "patrick@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Nurse Itohan Edobor",
            "profession": "Nurse",
            "license_number": "NMCN-2002",
            "regulatory_body": "NMCN",
            "facility_license_number": "EDO-CLIN-2002",
            "license_expiry_date": date(2026, 5, 28),
            "email": "itohan@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Pharm. Musa Salihu",
            "profession": "Pharmacist",
            "license_number": "PCN-2003",
            "regulatory_body": "PCN",
            "facility_license_number": "EDO-MAT-2003",
            "license_expiry_date": date(2026, 4, 5),
            "email": "musa@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Lab. Eunice Ojo",
            "profession": "Medical Laboratory Scientist",
            "license_number": "MLSCN-2004",
            "regulatory_body": "MLSCN",
            "facility_license_number": "EDO-LAB-2005",
            "license_expiry_date": date(2026, 6, 1),
            "email": "eunice@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Mrs. Faith Imade",
            "profession": "Midwife",
            "license_number": "MWB-2005",
            "regulatory_body": "NMCN",
            "facility_license_number": "EDO-MAT-2003",
            "license_expiry_date": date(2026, 11, 18),
            "email": "faith@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Mr. Samuel Edeh",
            "profession": "Community Health Extension Worker",
            "license_number": "CHEW-2006",
            "regulatory_body": "CHPRBN",
            "facility_license_number": "EDO-HOSP-2004",
            "license_expiry_date": date(2026, 8, 8),
            "email": "samuel@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Ms. Rachael Omoregie",
            "profession": "Radiographer",
            "license_number": "RRBN-2007",
            "regulatory_body": "RRBN",
            "facility_license_number": "EDO-HOSP-2001",
            "license_expiry_date": date(2026, 3, 22),
            "email": "rachael@edoherma.com",
            "password": "Password123!",
        },
        {
            "full_name": "Mr. David Eromosele",
            "profession": "Physiotherapist",
            "license_number": "MRTB-2008",
            "regulatory_body": "MRTB",
            "facility_license_number": "EDO-CLIN-2002",
            "license_expiry_date": date(2026, 7, 11),
            "email": "david@edoherma.com",
            "password": "Password123!",
        },
    ]

    personnel_added = 0
    personnel_skipped = 0

    for item in personnel_seed:
        existing = db.query(Personnel).filter(
            Personnel.license_number == item["license_number"]
        ).first()

        if existing:
            personnel_skipped += 1
            continue

        linked_facility = facility_map[item["facility_license_number"]]

        person = Personnel(
            id=uuid.uuid4(),
            full_name=item["full_name"],
            profession=item["profession"],
            license_number=item["license_number"],
            regulatory_body=item["regulatory_body"],
            facility_id=linked_facility.id,
            license_expiry_date=item["license_expiry_date"],
            status=get_license_status(item["license_expiry_date"]),
            email=item["email"],
            hashed_password=get_password_hash(item["password"]),
            is_active=True,
        )
        db.add(person)
        personnel_added += 1

    db.commit()

    return {
        "message": "Extra demo data seeded successfully",
        "facilities_added": facilities_added,
        "facilities_skipped": facilities_skipped,
        "personnel_added": personnel_added,
        "personnel_skipped": personnel_skipped,
    }

@router.post("/repair-personnel-login")
def repair_personnel_login(db: Session = Depends(get_db)):
    personnel_updates = [
        {
            "license_number": "MDCN-1001",
            "email": "osagie@edoherma.com",
            "password": "Password123!",
            "is_active": True,
        },
        {
            "license_number": "NMCN-1002",
            "email": "grace@edoherma.com",
            "password": "Password123!",
            "is_active": True,
        },
        {
            "license_number": "PCN-1003",
            "email": "bello@edoherma.com",
            "password": "Password123!",
            "is_active": True,
        },
    ]

    updated = 0
    missing = []

    for item in personnel_updates:
        person = db.query(Personnel).filter(
            Personnel.license_number == item["license_number"]
        ).first()

        if not person:
            missing.append(item["license_number"])
            continue

        person.email = item["email"]
        person.hashed_password = get_password_hash(item["password"])
        person.is_active = item["is_active"]
        updated += 1

    db.commit()

    return {
        "message": "Personnel login repaired successfully",
        "updated": updated,
        "missing": missing,
    }