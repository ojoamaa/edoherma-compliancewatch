from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, verify_token
from app.models.personnel import Personnel
from app.schemas.admin import Token
from app.schemas.personnel import PersonnelLogin, PersonnelMe

router = APIRouter(prefix="/api/personnel", tags=["Personnel Auth"])

bearer_scheme = HTTPBearer()

def get_current_personnel(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Personnel:
    token = credentials.credentials
    print("PERSONNEL RAW TOKEN:", token)

    payload = verify_token(token)
    print("PERSONNEL TOKEN PAYLOAD:", payload)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    email = payload.get("sub")
    role = payload.get("role")

    if not email or role != "personnel":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    personnel = (
        db.query(Personnel)
        .options(joinedload(Personnel.facility))
        .filter(Personnel.email == email)
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Personnel not found",
        )

    if not personnel.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Personnel account is inactive",
        )

    return personnel


@router.post("/login", response_model=Token)
def login_personnel(
    payload: PersonnelLogin,
    db: Session = Depends(get_db),
):
    personnel = (
        db.query(Personnel)
        .options(joinedload(Personnel.facility))
        .filter(Personnel.email == payload.email)
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not personnel.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Personnel account has no password set",
        )

    if not verify_password(payload.password, personnel.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not personnel.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Personnel account is inactive",
        )

    access_token = create_access_token(
        data={"sub": personnel.email, "role": "personnel"}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=PersonnelMe)
def read_personnel_me(current_personnel: Personnel = Depends(get_current_personnel)):
    return {
        "id": str(current_personnel.id),
        "full_name": current_personnel.full_name,
        "profession": current_personnel.profession,
        "license_number": current_personnel.license_number,
        "regulatory_body": current_personnel.regulatory_body,
        "facility_id": str(current_personnel.facility_id) if current_personnel.facility_id else None,
        "facility_name": current_personnel.facility.facility_name if current_personnel.facility else None,
        "lga": current_personnel.facility.lga if current_personnel.facility else None,
        "email": current_personnel.email,
        "status": current_personnel.status,
        "is_active": current_personnel.is_active,
        "created_at": current_personnel.created_at,
    }