from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.reminder_service import run_license_reminders

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])


@router.post(
    "/run",
    status_code=status.HTTP_200_OK,
)
def trigger_license_reminders(
    db: Session = Depends(get_db),
):
    results = run_license_reminders(db)

    return {
        "message": "Reminder scan completed",
        "total_processed": len(results),
        "records": results,
    }