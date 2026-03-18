from typing import Any
from pydantic import BaseModel


class DashboardOverview(BaseModel):
    summary: dict[str, Any]
    expired_facilities: list[dict[str, Any]]
    expiring_facilities: list[dict[str, Any]]
    expired_personnel: list[dict[str, Any]]
    expiring_personnel: list[dict[str, Any]]
