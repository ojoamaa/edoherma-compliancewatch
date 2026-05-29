import os

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.admin import AdminUser


load_dotenv()


def create_default_admin():
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    full_name = os.getenv("ADMIN_FULL_NAME", "System Administrator")

    if not email or not password:
        print("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")
        return

    db: Session = SessionLocal()

    try:
        existing_admin = (
            db.query(AdminUser)
            .filter(AdminUser.email == email)
            .first()
        )

        if existing_admin:
            existing_admin.full_name = full_name
            existing_admin.hashed_password = get_password_hash(password)
            existing_admin.is_active = True

            db.commit()

            print("Admin already existed. Password updated.")
            return

        admin = AdminUser(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    create_default_admin()