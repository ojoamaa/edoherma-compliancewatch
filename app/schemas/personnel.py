from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class PersonnelCreate(BaseModel):
    full_name: str
    profession: str
    license_number: str
    regulatory_body: str | None = None
    facility_id: UUID | None = None
    email: EmailStr | None = None
    password: str | None = None
    license_expiry_date: date


class PersonnelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    profession: str
    license_number: str
    regulatory_body: str | None = None
    facility_id: UUID | None = None
    facility_name: str | None = None
    lga: str | None = None
    email: EmailStr | None = None
    license_expiry_date: date
    status: str | None = None
    is_active: bool
    created_at: datetime | None = None


class PersonnelLogin(BaseModel):
    email: EmailStr
    password: str


class PersonnelMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    profession: str
    license_number: str
    regulatory_body: str | None = None
    facility_id: str | None = None
    facility_name: str | None = None
    lga: str | None = None
    email: EmailStr | None = None
    status: str | None = None
    is_active: bool
    created_at: datetime | None = None