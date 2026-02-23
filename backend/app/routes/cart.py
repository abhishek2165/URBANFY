from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cart import Cart
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartAdd, CartUpdate, CartItemResponse, CartResponse
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


# ============================================
# GET CART
# ============================================
@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's cart"""

    try:
        cart_items = db.query(Cart).filter(Cart.user_id == current_user.id).all()

        items = []
        total_price = 0.0

        for item in cart_items:
            product = item.product
            if not product or not product.is_active:
                continue

            price = float(product.discount_price) if product.discount_price else float(product.price)
            item_total = price * item.quantity
            total_price += item_total

            items.append(CartItemResponse(
                id=item.id,
                product_id=product.id,
                product_name=product.name,
                product_image=product.image_url,
                product_brand=product.brand,
                price=float(product.price),
                discount_price=float(product.discount_price) if product.discount_price else None,
                quantity=item.quantity,
                item_total=item_total
            ))

        return CartResponse(
            success=True,
            total_items=len(items),
            total_price=round(total_price, 2),
            items=items
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cart: {str(e)}"
        )


# ============================================
# ADD TO CART
# ============================================
@router.post("/add", response_model=CartResponse)
async def add_to_cart(
    cart_data: CartAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add product to cart"""

    try:
        # Check product exists
        product = db.query(Product).filter(
            Product.id == cart_data.product_id,
            Product.is_active == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Check stock
        if product.stock < cart_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items available in stock"
            )

        # Check if already in cart
        existing = db.query(Cart).filter(
            Cart.user_id == current_user.id,
            Cart.product_id == cart_data.product_id
        ).first()

        if existing:
            new_qty = existing.quantity + cart_data.quantity
            if new_qty > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {product.stock} items available in stock"
                )
            existing.quantity = new_qty
        else:
            new_item = Cart(
                user_id=current_user.id,
                product_id=cart_data.product_id,
                quantity=cart_data.quantity
            )
            db.add(new_item)

        db.commit()

        # Return updated cart
        return await get_cart(current_user, db)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add to cart: {str(e)}"
        )


# ============================================
# UPDATE CART ITEM QUANTITY
# ============================================
@router.put("/{cart_id}", response_model=CartResponse)
async def update_cart_item(
    cart_id: int,
    cart_data: CartUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""

    try:
        cart_item = db.query(Cart).filter(
            Cart.id == cart_id,
            Cart.user_id == current_user.id
        ).first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )

        if cart_data.quantity <= 0:
            db.delete(cart_item)
            db.commit()
            return await get_cart(current_user, db)

        # Check stock
        product = cart_item.product
        if cart_data.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items available"
            )

        cart_item.quantity = cart_data.quantity
        db.commit()

        return await get_cart(current_user, db)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update cart: {str(e)}"
        )


# ============================================
# REMOVE FROM CART
# ============================================
@router.delete("/{cart_id}", response_model=CartResponse)
async def remove_from_cart(
    cart_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""

    try:
        cart_item = db.query(Cart).filter(
            Cart.id == cart_id,
            Cart.user_id == current_user.id
        ).first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )

        db.delete(cart_item)
        db.commit()

        return await get_cart(current_user, db)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove from cart: {str(e)}"
        )


# ============================================
# CLEAR CART
# ============================================
@router.delete("/clear/all", response_model=dict)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear entire cart"""

    try:
        db.query(Cart).filter(Cart.user_id == current_user.id).delete()
        db.commit()

        return {"success": True, "message": "Cart cleared successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cart: {str(e)}"
        )