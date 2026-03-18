from pydantic import BaseModel, EmailStr


class PersonnelLogin(BaseModel):
    email: EmailStr
    password: str


class PersonnelResponse(BaseModel):
    id: str
    full_name: str
    profession: str
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True
