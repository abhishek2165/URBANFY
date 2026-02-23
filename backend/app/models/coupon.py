from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, DECIMAL
from sqlalchemy.sql import func
from app.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    discount_type = Column(Enum("percentage", "fixed"), default="percentage")
    discount_value = Column(DECIMAL(10, 2), nullable=False)
    min_order_value = Column(DECIMAL(10, 2), default=0.00)
    max_discount = Column(DECIMAL(10, 2), nullable=True)
    usage_limit = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class CouponUsage(Base):
    __tablename__ = "coupon_usage"

    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    order_id = Column(Integer, nullable=False)
    discount_amount = Column(DECIMAL(10, 2), nullable=False)
    used_at = Column(DateTime, server_default=func.now())