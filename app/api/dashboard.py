from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.admin import AdminUser
from app.models.facility import Facility
from app.models.personnel import Personnel

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

bearer_scheme = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    role = payload.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    admin = db.query(AdminUser).filter(AdminUser.email == email).first()

    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")

    return admin


@router.get("/overview")
def dashboard_overview(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    facilities = db.query(Facility).all()
    personnel = db.query(Personnel).all()

    def status_filter(items, status):
        return [i for i in items if (i.status or "").lower() == status]

    def status_group(items, statuses):
        return [i for i in items if (i.status or "").lower() in statuses]

    return {
        "summary": {
            "total_facilities": len(facilities),
            "active_facilities": len(status_filter(facilities, "active")),
            "expired_facilities": len(status_filter(facilities, "expired")),
            "expiring_facilities": len(status_group(facilities, ["expiring", "expiring soon"])),

            "total_personnel": len(personnel),
            "active_personnel": len(status_filter(personnel, "active")),
            "expired_personnel": len(status_filter(personnel, "expired")),
            "expiring_personnel": len(status_group(personnel, ["expiring", "expiring soon"])),
        },
        "all_facilities": facilities,
        "all_personnel": personnel,
        "expired_facilities": status_filter(facilities, "expired"),
        "expiring_facilities": status_group(facilities, ["expiring", "expiring soon"]),
        "expired_personnel": status_filter(personnel, "expired"),
        "expiring_personnel": status_group(personnel, ["expiring", "expiring soon"]),
        "admin": {
            "id": current_admin.id,
            "full_name": current_admin.full_name,
            "email": current_admin.email,
        },
    }