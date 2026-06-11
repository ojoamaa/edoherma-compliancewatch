from app.core.database import SessionLocal
from app.models.facility import Facility
from datetime import date, timedelta


def seed_facilities():
    db = SessionLocal()

    existing = db.query(Facility).first()

    if existing:
        print("Facilities already exist")
        db.close()
        return

    facilities = [
        Facility(
            facility_name="Central Hospital Benin",
            facility_type="Hospital",
            lga="Oredo",
            address="Benin City, Edo State",
            license_number="FAC-1001",
            license_issue_date=date.today() - timedelta(days=365),
            license_expiry_date=date.today() + timedelta(days=90),
            status="Active",
        ),
        Facility(
            facility_name="Royal Clinic",
            facility_type="Clinic",
            lga="Ikpoba Okha",
            address="Ikpoba Okha, Edo State",
            license_number="FAC-1002",
            license_issue_date=date.today() - timedelta(days=365),
            license_expiry_date=date.today() - timedelta(days=30),
            status="Expired",
        ),
        Facility(
            facility_name="Hope Maternity",
            facility_type="Maternity",
            lga="Egor",
            address="Egor, Edo State",
            license_number="FAC-1003",
            license_issue_date=date.today() - timedelta(days=365),
            license_expiry_date=date.today() + timedelta(days=14),
            status="Expiring Soon",
        ),
    ]

    db.add_all(facilities)
    db.commit()
    db.close()

    print("Facilities seeded successfully")


if __name__ == "__main__":
    seed_facilities()