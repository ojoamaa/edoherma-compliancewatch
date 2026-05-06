from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.personnel import Personnel


def create_default_personnel():
    db = SessionLocal()

    try:
        existing = db.query(Personnel).filter(
            Personnel.email == "osagie@edoherma.com"
        ).first()

        if existing:
            print("Personnel already exists")
            return

        personnel = Personnel(
            full_name="Dr. Osagie Ehimare",
            email="osagie@edoherma.com",
            hashed_password=get_password_hash("password123"),
            profession="Doctor",
            license_number="MDCN-1001",
            regulatory_body="MDCN",
            facility_name="GraceVeil Hospital",
            lga="Egor",
            status="Active",
            is_active=True,
        )

        db.add(personnel)
        db.commit()

        print("Default personnel created")

    finally:
        db.close()