from datetime import date, datetime
from pydantic import BaseModel


class FacilityCreate(BaseModel):
    facility_name: str
    facility_type: str
    lga: str
    address: str
    license_number: str
    license_issue_date: date
    license_expiry_date: date


class FacilityOut(BaseModel):
    id: str
    facility_name: str
    facility_type: str
    lga: str
    address: str
    license_number: str
    license_issue_date: date
    license_expiry_date: date
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}