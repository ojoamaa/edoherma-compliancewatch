from pydantic import BaseModel


class ComplianceSummary(BaseModel):
    total_facilities: int
    active_facilities: int
    expiring_facilities: int
    expired_facilities: int
    total_personnel: int
    active_personnel: int
    expiring_personnel: int
    expired_personnel: int
