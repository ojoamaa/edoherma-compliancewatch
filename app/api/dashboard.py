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
) -> AdminUser:
    token = credentials.credentials
    payload = verify_token(token)
    print("DASHBOARD TOKEN PAYLOAD:", payload)

    if not payload:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
    )

    email = payload.get("sub")
    role = payload.get("role")

    if not email or role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    admin = db.query(AdminUser).filter(AdminUser.email == email).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
        )

    return admin


@router.get("/overview")
def dashboard_overview(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    facilities = db.query(Facility).all()
    personnel = db.query(Personnel).all()

    active_facilities = [f for f in facilities if (f.status or "").lower() == "active"]
    expired_facilities = [f for f in facilities if (f.status or "").lower() == "expired"]
    expiring_facilities = [
        f for f in facilities if (f.status or "").lower() in ["expiring", "expiring soon"]
    ]

    active_personnel = [p for p in personnel if (p.status or "").lower() == "active"]
    expired_personnel = [p for p in personnel if (p.status or "").lower() == "expired"]
    expiring_personnel = [
        p for p in personnel if (p.status or "").lower() in ["expiring", "expiring soon"]
    ]

    return {
        "summary": {
            "total_facilities": len(facilities),
            "active_facilities": len(active_facilities),
            "expired_facilities": len(expired_facilities),
            "expiring_facilities": len(expiring_facilities),
            "total_personnel": len(personnel),
            "active_personnel": len(active_personnel),
            "expired_personnel": len(expired_personnel),
            "expiring_personnel": len(expiring_personnel),
        },
        "all_facilities": facilities,
        "all_personnel": personnel,
        "expired_facilities": expired_facilities,
        "expiring_facilities": expiring_facilities,
        "expired_personnel": expired_personnel,
        "expiring_personnel": expiring_personnel,
        "admin": {
            "id": current_admin.id,
            "full_name": current_admin.full_name,
            "email": current_admin.email,
        },
    }