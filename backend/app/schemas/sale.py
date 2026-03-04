from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SaleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    banner_image: Optional[str] = None
    discount_type: str = "percentage"
    discount_value: float
    start_date: datetime
    end_date: datetime
    product_ids: List[int] = []


class SaleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    banner_image: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    product_ids: Optional[List[int]] = None


class SaleProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    discount_price: Optional[float] = None
    image_url: Optional[str] = None
    brand: Optional[str] = None

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    banner_image: Optional[str] = None
    discount_type: str
    discount_value: float
    start_date: datetime
    end_date: datetime
    is_active: bool
    products: List[SaleProductResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SaleListResponse(BaseModel):
    success: bool
    total: int
    sales: List[SaleResponse]