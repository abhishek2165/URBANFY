from sqlalchemy import (
    Column, Integer, String, Text, DECIMAL, Boolean,
    Enum, ForeignKey, TIMESTAMP
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    banner_image = Column(String(500), nullable=True)
    discount_type = Column(Enum("percentage", "fixed"), default="percentage")
    discount_value = Column(DECIMAL(10, 2), nullable=False)
    start_date = Column(TIMESTAMP, nullable=False)
    end_date = Column(TIMESTAMP, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    products = relationship("SaleProduct", back_populates="sale")


class SaleProduct(Base):
    __tablename__ = "sale_products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    sale = relationship("Sale", back_populates="products")
    product = relationship("Product")