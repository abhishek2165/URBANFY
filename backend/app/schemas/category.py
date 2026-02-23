from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None