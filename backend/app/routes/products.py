from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
from math import ceil
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import (
    ProductResponse,
    ProductListResponse,
    ProductCreate,
    ProductUpdate,
)
from app.middleware.auth_middleware import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])


# ============================================
# HELPER: Build product response
# ============================================
def build_product_response(product, category_name=None):
    # Calculate discount percent
    discount_percent = None
    if product.discount_price and product.price:
        price = float(product.price)
        disc = float(product.discount_price)
        if price > 0:
            discount_percent = int(((price - disc) / price) * 100)

    return ProductResponse(
        id=product.id,
        name=product.name,
        slug=product.slug,
        category_id=product.category_id,
        category_name=category_name,
        price=float(product.price),
        discount_price=float(product.discount_price) if product.discount_price else None,
        discount_percent=discount_percent,
        stock=product.stock,
        description=product.description,
        short_description=product.short_description,
        image_url=product.image_url,
        image_gallery=product.image_gallery,
        brand=product.brand,
        volume=product.volume,
        gender=product.gender,
        rating=float(product.rating) if product.rating else 0.0,
        total_reviews=product.total_reviews,
        is_featured=product.is_featured,
        is_active=product.is_active,
        created_at=product.created_at
    )


# ============================================
# GET ALL PRODUCTS (with filters, search, sort, pagination)
# ============================================
@router.get("/", response_model=ProductListResponse)
async def get_products(
    category: Optional[str] = Query(None, description="Category slug"),
    search: Optional[str] = Query(None, description="Search by name"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    featured: Optional[bool] = Query(None, description="Featured only"),
    sort: Optional[str] = Query("newest", description="Sort: newest, price_low, price_high, rating, name"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get all products with filters"""

    try:
        # Base query
        query = db.query(Product).filter(Product.is_active == True)

        # Filter by category
        if category:
            cat = db.query(Category).filter(Category.slug == category).first()
            if cat:
                query = query.filter(Product.category_id == cat.id)

        # Search by name
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.brand.ilike(f"%{search}%")
                )
            )

        # Filter by brand
        if brand:
            query = query.filter(Product.brand.ilike(f"%{brand}%"))

        # Filter by gender
        if gender:
            query = query.filter(Product.gender == gender)

        # Filter by price range
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Filter featured
        if featured is not None:
            query = query.filter(Product.is_featured == featured)

        # Sorting
        if sort == "price_low":
            query = query.order_by(asc(Product.price))
        elif sort == "price_high":
            query = query.order_by(desc(Product.price))
        elif sort == "rating":
            query = query.order_by(desc(Product.rating))
        elif sort == "name":
            query = query.order_by(asc(Product.name))
        else:  # newest
            query = query.order_by(desc(Product.created_at))

        # Total count
        total = query.count()

        # Pagination
        total_pages = ceil(total / per_page) if total > 0 else 1
        offset = (page - 1) * per_page
        products = query.offset(offset).limit(per_page).all()

        # Build response
        product_list = []
        for prod in products:
            cat_name = None
            if prod.category:
                cat_name = prod.category.name
            product_list.append(build_product_response(prod, cat_name))

        return ProductListResponse(
            success=True,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            products=product_list
        )

    except Exception as e:
        print(f"Get Products Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )


# ============================================
# GET FEATURED PRODUCTS
# ============================================
@router.get("/featured", response_model=list)
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get featured products"""

    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_featured == True
    ).order_by(desc(Product.created_at)).limit(limit).all()

    result = []
    for prod in products:
        cat_name = prod.category.name if prod.category else None
        result.append(build_product_response(prod, cat_name))

    return result


# ============================================
# GET SINGLE PRODUCT BY ID
# ============================================
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID"""

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    cat_name = product.category.name if product.category else None
    return build_product_response(product, cat_name)


# ============================================
# GET PRODUCT BY SLUG
# ============================================
@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get product by slug"""

    product = db.query(Product).filter(
        Product.slug == slug,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    cat_name = product.category.name if product.category else None
    return build_product_response(product, cat_name)


# ============================================
# GET SIMILAR PRODUCTS
# ============================================
@router.get("/{product_id}/similar", response_model=list)
async def get_similar_products(
    product_id: int,
    limit: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get similar products from same category"""

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    similar = db.query(Product).filter(
        Product.category_id == product.category_id,
        Product.id != product_id,
        Product.is_active == True
    ).order_by(desc(Product.rating)).limit(limit).all()

    result = []
    for prod in similar:
        cat_name = prod.category.name if prod.category else None
        result.append(build_product_response(prod, cat_name))

    return result


# ============================================
# ADMIN: CREATE PRODUCT
# ============================================
@router.post("/admin/create", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Create a new product"""

    try:
        # Check slug unique
        existing = db.query(Product).filter(Product.slug == product_data.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product slug already exists"
            )

        # Check category exists
        category = db.query(Category).filter(Category.id == product_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )

        new_product = Product(
            name=product_data.name,
            slug=product_data.slug,
            category_id=product_data.category_id,
            price=product_data.price,
            discount_price=product_data.discount_price,
            stock=product_data.stock,
            description=product_data.description,
            short_description=product_data.short_description,
            image_url=product_data.image_url,
            image_gallery=product_data.image_gallery,
            brand=product_data.brand or "URBUNFY",
            volume=product_data.volume,
            gender=product_data.gender or "unisex",
            is_featured=product_data.is_featured,
            is_active=True
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return build_product_response(new_product, category.name)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


# ============================================
# ADMIN: UPDATE PRODUCT
# ============================================
@router.put("/admin/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Update a product"""

    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if product_data.name is not None:
            product.name = product_data.name
        if product_data.slug is not None:
            product.slug = product_data.slug
        if product_data.category_id is not None:
            product.category_id = product_data.category_id
        if product_data.price is not None:
            product.price = product_data.price
        if product_data.discount_price is not None:
            product.discount_price = product_data.discount_price
        if product_data.stock is not None:
            product.stock = product_data.stock
        if product_data.description is not None:
            product.description = product_data.description
        if product_data.short_description is not None:
            product.short_description = product_data.short_description
        if product_data.image_url is not None:
            product.image_url = product_data.image_url
        if product_data.image_gallery is not None:
            product.image_gallery = product_data.image_gallery
        if product_data.brand is not None:
            product.brand = product_data.brand
        if product_data.volume is not None:
            product.volume = product_data.volume
        if product_data.gender is not None:
            product.gender = product_data.gender
        if product_data.is_featured is not None:
            product.is_featured = product_data.is_featured
        if product_data.is_active is not None:
            product.is_active = product_data.is_active

        db.commit()
        db.refresh(product)

        cat_name = product.category.name if product.category else None
        return build_product_response(product, cat_name)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )


# ============================================
# ADMIN: DELETE PRODUCT (Permanent)
# ============================================
@router.delete("/admin/{product_id}")
async def delete_product(
    product_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Delete a product permanently from database"""

    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        product_name = product.name
        db.delete(product)
        db.commit()

        return {
            "success": True,
            "message": f"Product '{product_name}' deleted permanently from database"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product: {str(e)}"
        )