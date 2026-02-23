from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================
# PRODUCT RESPONSE
# ============================================
class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    category_id: int
    category_name: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    discount_percent: Optional[int] = None
    stock: int
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    image_gallery: Optional[list] = None
    brand: Optional[str] = None
    volume: Optional[str] = None
    gender: Optional[str] = None
    rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0
    is_featured: bool = False
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# PRODUCT LIST RESPONSE (with pagination)
# ============================================
class ProductListResponse(BaseModel):
    success: bool
    total: int
    page: int
    per_page: int
    total_pages: int
    products: List[ProductResponse]


# ============================================
# CREATE PRODUCT (Admin)
# ============================================
class ProductCreate(BaseModel):
    name: str
    slug: str
    category_id: int
    price: float
    discount_price: Optional[float] = None
    stock: int = 0
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    image_gallery: Optional[list] = None
    brand: Optional[str] = "URBUNFY"
    volume: Optional[str] = None
    gender: Optional[str] = "unisex"
    is_featured: bool = False


# ============================================
# UPDATE PRODUCT (Admin)
# ============================================
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    image_gallery: Optional[list] = None
    brand: Optional[str] = None
    volume: Optional[str] = None
    gender: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None