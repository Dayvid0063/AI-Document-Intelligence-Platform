import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Request schemas (what the client sends) ----------

class UserCreate(BaseModel):
    """Payload for POST /auth/register"""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """Payload for POST /auth/login"""
    email: EmailStr
    password: str


# ---------- Response schemas (what the API returns) ----------

class UserResponse(BaseModel):
    """Public-facing user data — never includes the password hash."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime


class Token(BaseModel):
    """Returned after successful login/register."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Shape of the decoded JWT payload."""
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None