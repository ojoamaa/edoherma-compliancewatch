from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.admin import AdminUser


def create_default_admin(db: Session):
    admin_email = "admin@edoherma.com"
    admin_password = "Admin@12345"
    admin_name = "System Administrator"

    existing_admin = db.query(AdminUser).first()

    if existing_admin:
        existing_admin.full_name = admin_name
        existing_admin.email = admin_email
        existing_admin.hashed_password = get_password_hash(admin_password)
        existing_admin.is_active = True
        db.commit()
        db.refresh(existing_admin)
        return existing_admin

    admin = AdminUser(
        full_name=admin_name,
        email=admin_email,
        hashed_password=get_password_hash(admin_password),
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin