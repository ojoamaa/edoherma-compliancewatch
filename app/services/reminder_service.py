import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models.personnel import Personnel
from app.models.reminder_log import ReminderLog
from app.services.sms_service import send_sms


def run_license_reminders(db: Session):
    today = date.today()
    results = []

    personnel_records = db.query(Personnel).all()

    for person in personnel_records:
        if not person.phone_number or not person.license_expiry_date:
            continue

        days_left = (person.license_expiry_date - today).days

        if days_left not in [1, 7, 14, 30, 365]:
            continue

        reminder_type = f"{days_left}_days"

        existing_log = (
            db.query(ReminderLog)
            .filter(
                ReminderLog.personnel_id == person.id,
                ReminderLog.reminder_type == reminder_type,
            )
            .first()
        )

        if existing_log:
            continue

        message = (
            f"Dear {person.full_name}, your professional license "
            f"will expire in {days_left} day(s). "
            f"Please renew promptly to remain compliant with EdoHERMA regulations."
        )

        success = send_sms(person.phone_number, message)

        log = ReminderLog(
            id=uuid.uuid4(),
            personnel_id=person.id,
            reminder_type=reminder_type,
            channel="sms",
            status="success" if success else "failed",
            message=message,
        )

        db.add(log)

        results.append(
            {
                "personnel_id": str(person.id),
                "full_name": person.full_name,
                "phone_number": person.phone_number,
                "days_left": days_left,
                "status": log.status,
            }
        )

    db.commit()
    return results