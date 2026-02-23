from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse, CategoryCreate

router = APIRouter(prefix="/categories", tags=["Categories"])


# ============================================
# GET ALL CATEGORIES
# ============================================
@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """Get all active categories"""

    categories = db.query(Category).filter(Category.is_active == True).all()

    result = []
    for cat in categories:
        result.append(CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            image_url=cat.image_url,
            is_active=cat.is_active,
            created_at=cat.created_at
        ))

    return result


# ============================================
# GET CATEGORY BY SLUG
# ============================================
@router.get("/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get category by slug"""

    category = db.query(Category).filter(
        Category.slug == slug,
        Category.is_active == True
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        image_url=category.image_url,
        is_active=category.is_active,
        created_at=category.created_at
    )