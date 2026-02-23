from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.review import Review
from app.models.product import Product
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ProductReviewsResponse,
)
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# ============================================
# ADD REVIEW
# ============================================
@router.post("/", response_model=ReviewResponse)
async def add_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a review for a product"""

    try:
        # Check product exists
        product = db.query(Product).filter(
            Product.id == review_data.product_id,
            Product.is_active == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Check if already reviewed
        existing = db.query(Review).filter(
            Review.user_id == current_user.id,
            Review.product_id == review_data.product_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this product"
            )

        # Create review
        new_review = Review(
            user_id=current_user.id,
            product_id=review_data.product_id,
            rating=review_data.rating,
            title=review_data.title,
            comment=review_data.comment,
            is_approved=True
        )

        db.add(new_review)
        db.flush()

        # Update product rating
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.product_id == review_data.product_id,
            Review.is_approved == True
        ).scalar()

        total_reviews = db.query(func.count(Review.id)).filter(
            Review.product_id == review_data.product_id,
            Review.is_approved == True
        ).scalar()

        product.rating = round(float(avg_rating), 2) if avg_rating else 0.0
        product.total_reviews = total_reviews or 0

        db.commit()
        db.refresh(new_review)

        user_name = f"{current_user.first_name} {current_user.last_name}"

        return ReviewResponse(
            id=new_review.id,
            user_id=new_review.user_id,
            user_name=user_name,
            product_id=new_review.product_id,
            rating=new_review.rating,
            title=new_review.title,
            comment=new_review.comment,
            is_approved=new_review.is_approved,
            created_at=new_review.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add review: {str(e)}"
        )


# ============================================
# GET PRODUCT REVIEWS
# ============================================
@router.get("/product/{product_id}", response_model=ProductReviewsResponse)
async def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a product"""

    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        reviews = db.query(Review).filter(
            Review.product_id == product_id,
            Review.is_approved == True
        ).order_by(desc(Review.created_at)).all()

        review_list = []
        for review in reviews:
            user = review.user
            user_name = f"{user.first_name} {user.last_name}" if user else "Unknown"

            review_list.append(ReviewResponse(
                id=review.id,
                user_id=review.user_id,
                user_name=user_name,
                product_id=review.product_id,
                rating=review.rating,
                title=review.title,
                comment=review.comment,
                is_approved=review.is_approved,
                created_at=review.created_at
            ))

        # Calculate average
        avg_rating = 0.0
        if reviews:
            total = sum(r.rating for r in reviews)
            avg_rating = round(total / len(reviews), 2)

        return ProductReviewsResponse(
            success=True,
            product_id=product_id,
            total_reviews=len(review_list),
            average_rating=avg_rating,
            reviews=review_list
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get reviews: {str(e)}"
        )


# ============================================
# DELETE MY REVIEW
# ============================================
@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete own review"""

    try:
        review = db.query(Review).filter(
            Review.id == review_id,
            Review.user_id == current_user.id
        ).first()

        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )

        product_id = review.product_id
        db.delete(review)

        # Update product rating
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.product_id == product_id,
            Review.is_approved == True
        ).scalar()

        total_reviews = db.query(func.count(Review.id)).filter(
            Review.product_id == product_id,
            Review.is_approved == True
        ).scalar()

        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.rating = round(float(avg_rating), 2) if avg_rating else 0.0
            product.total_reviews = total_reviews or 0

        db.commit()

        return {"success": True, "message": "Review deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete review: {str(e)}"
        )