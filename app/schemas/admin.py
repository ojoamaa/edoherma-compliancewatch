from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class AdminMe(BaseModel):
    id: str
    full_name: str
    email: EmailStr