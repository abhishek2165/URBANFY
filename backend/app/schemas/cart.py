from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================
# ADD TO CART
# ============================================
class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1


# ============================================
# UPDATE CART QUANTITY
# ============================================
class CartUpdate(BaseModel):
    quantity: int


# ============================================
# CART ITEM RESPONSE
# ============================================
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    product_brand: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    quantity: int
    item_total: float

    class Config:
        from_attributes = True


# ============================================
# FULL CART RESPONSE
# ============================================
class CartResponse(BaseModel):
    success: bool
    total_items: int
    total_price: float
    items: List[CartItemResponse]