from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# ============================================
# PLACE ORDER REQUEST
# ============================================
class OrderCreate(BaseModel):
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: str = "8999323926"
    payment_method: str = "COD"
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    friend_name: Optional[str] = None 


# ============================================
# ORDER ITEM RESPONSE
# ============================================
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    price: float
    quantity: int
    total: float
    friend_name: Optional[str] = None    # ⬅️ NEW 
    class Config:
        from_attributes = True
     


# ============================================
# ORDER RESPONSE
# ============================================
class OrderResponse(BaseModel):
    id: int
    order_number: str
    total_price: float
    discount_amount: float
    shipping_charge: float
    final_price: float
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: str
    payment_method: str
    payment_status: str
    order_status: str
    notes: Optional[str] = None
    items: List[OrderItemResponse] = []
    created_at: Optional[datetime] = None

    # ⬅️ NEW: Expected Delivery Date
    expected_delivery: Optional[date] = None
    expected_delivery_formatted: Optional[str] = None

    # ===== नवीन RAZORPAY FIELDS =====
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    # =================================

    class Config:
        from_attributes = True


# ============================================
# ORDER LIST RESPONSE
# ============================================
class OrderListResponse(BaseModel):
    success: bool
    total: int
    orders: List[OrderResponse]


# ============================================
# UPDATE ORDER STATUS (Admin)
# ============================================
class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None

    # ============================================
# नवीन - RAZORPAY SCHEMAS
# ============================================
class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int
    currency: str
    order_id: int
    order_number: str
    key_id: str


class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: int
    
class OrderCreate(BaseModel):
    address: str
    city: str
    state: str
    pincode: str
    phone: Optional[str] = "8999323926"
    payment_method: Optional[str] = "COD"
    notes: Optional[str] = None
    coupon_code: Optional[str] = None    # ← हे add करा    