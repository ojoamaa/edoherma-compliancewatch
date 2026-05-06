from fastapi import HTTPException, status

from app.core.config import settings


def require_production_unlock():
    if not settings.production_unlocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature is locked pending production activation.",
        )
