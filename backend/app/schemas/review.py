from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================
# CREATE REVIEW
# ============================================
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


# ============================================
# REVIEW RESPONSE
# ============================================
class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    product_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    is_approved: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# PRODUCT REVIEWS RESPONSE
# ============================================
class ProductReviewsResponse(BaseModel):
    success: bool
    product_id: int
    total_reviews: int
    average_rating: float
    reviews: List[ReviewResponse]