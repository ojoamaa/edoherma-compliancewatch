from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.personnel import Personnel
from datetime import date


def create_default_personnel():
    db = SessionLocal()

    existing = db.query(Personnel).filter(
        Personnel.email == "osagie@edoherma.com"
    ).first()

    if existing:
        print("Personnel already exists")
        db.close()
        return

    personnel = Personnel(
        full_name="Dr. Osagie Ehimare",
        email="osagie@edoherma.com",
        hashed_password=get_password_hash("password123"),
        profession="Doctor",
        license_number="MDCN-1001",
        regulatory_body="MDCN",
        phone_number="08000000000",
        facility_id=None,
        license_expiry_date=date(2027, 12, 31),
        status="Active",
        is_active=True,
    )

    db.add(personnel)
    db.commit()
    db.close()

    print("Default personnel created")