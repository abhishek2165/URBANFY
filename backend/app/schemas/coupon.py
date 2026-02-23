from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CouponApplyRequest(BaseModel):
    code: str
    cart_total: float


class CouponApplyResponse(BaseModel):
    success: bool
    message: str
    coupon_code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    discount_amount: Optional[float] = None
    min_order_value: Optional[float] = None
    final_total: Optional[float] = None


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    min_order_value: float
    max_discount: Optional[float]
    is_active: bool
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True