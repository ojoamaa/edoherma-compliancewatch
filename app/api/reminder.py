from datetime import date, timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.admin_auth import require_roles
from app.api.access_control import require_production_unlock
from app.core.database import get_db
from app.models.personnel import Personnel

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])


@router.post(
    "/run",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_production_unlock)],
)
def trigger_license_reminders(
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles("admin", "admin_manager")),
):
    today = date.today()
    target_date = today + timedelta(days=14)

    personnel_due = (
        db.query(Personnel)
        .filter(Personnel.license_expiry_date == target_date)
        .all()
    )

    return {
        "message": "Reminder scan completed. SMS sending is not yet activated.",
        "target_date": str(target_date),
        "personnel_found": len(personnel_due),
        "records": [
            {
                "id": str(person.id),
                "full_name": person.full_name,
                "email": person.email,
                "phone_number": person.phone_number,
                "license_number": person.license_number,
                "license_expiry_date": str(person.license_expiry_date),
            }
            for person in personnel_due
        ],
    }