from sqlalchemy import (
    Column, Integer, String, Text, DECIMAL,
    Enum, ForeignKey, TIMESTAMP, Date
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    discount_amount = Column(DECIMAL(10, 2), default=0.00)
    shipping_charge = Column(DECIMAL(10, 2), default=0.00)
    final_price = Column(DECIMAL(10, 2), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=False, default="8999323926")
    payment_method = Column(Enum("COD", "Online"), default="COD")
    payment_status = Column(Enum("Pending", "Paid", "Failed", "Refunded"), default="Pending")
    order_status = Column(Enum("Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"), default="Pending")
    notes = Column(Text, nullable=True)

    # Razorpay fields
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    coupon_code = Column(String(50), nullable=True)
    friend_name = Column(String(200), nullable=True)

    # ⬅️ NEW: Expected Delivery Date
    expected_delivery = Column(Date, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(255), nullable=False)
    product_image = Column(String(500), nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")