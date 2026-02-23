from sqlalchemy import (
    Column, Integer, String, Boolean, Text, TIMESTAMP,
    DECIMAL, Enum, ForeignKey, JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    discount_price = Column(DECIMAL(10, 2), nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    image_gallery = Column(JSON, nullable=True)
    brand = Column(String(100), nullable=True)
    volume = Column(String(50), nullable=True)
    gender = Column(Enum("male", "female", "unisex"), default="unisex")
    rating = Column(DECIMAL(3, 2), default=0.00)
    total_reviews = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationship
    category = relationship("Category", back_populates="products")