from datetime import timedelta

from app.core.security import create_access_token, verify_token


def create_refresh_token(data: dict) -> str:
    return create_access_token(
        data,
        expires_delta=timedelta(days=7),
    )