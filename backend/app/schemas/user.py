from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ============================================
# SIGNUP SCHEMA
# ============================================
class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = "8999323926"

    @field_validator("first_name")
    @classmethod
    def validate_first_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("First name must be at least 2 characters")
        return v.strip()

    @field_validator("last_name")
    @classmethod
    def validate_last_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Last name must be at least 2 characters")
        return v.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


# ============================================
# LOGIN SCHEMA
# ============================================
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ============================================
# USER RESPONSE (What we send back)
# ============================================
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# AUTH RESPONSE (Token + User)
# ============================================
class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse


# ============================================
# UPDATE PROFILE SCHEMA
# ============================================
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


# ============================================
# CHANGE PASSWORD SCHEMA
# ============================================
class ChangePassword(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters")
        return v