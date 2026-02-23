from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.coupon import Coupon, CouponUsage
from app.models.user import User
from app.schemas.coupon import CouponApplyRequest, CouponApplyResponse, CouponResponse
from app.middleware.auth_middleware import get_current_user, get_current_admin

router = APIRouter(prefix="/coupons", tags=["Coupons"])


# ============================================
# APPLY COUPON
# ============================================
@router.post("/apply", response_model=CouponApplyResponse)
async def apply_coupon(
    data: CouponApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Coupon code apply करा"""
    try:
        code = data.code.strip().upper()
        cart_total = data.cart_total

        # ---- Find coupon ----
        coupon = db.query(Coupon).filter(
            Coupon.code == code
        ).first()

        if not coupon:
            return CouponApplyResponse(
                success=False,
                message="Invalid coupon code. Please check and try again."
            )

        # ---- Check if active ----
        if not coupon.is_active:
            return CouponApplyResponse(
                success=False,
                message="This coupon is no longer active."
            )

        # ---- Check expiry ----
        if coupon.expires_at and coupon.expires_at < datetime.now():
            return CouponApplyResponse(
                success=False,
                message="This coupon has expired."
            )

        # ---- Check usage limit ----
        if coupon.used_count >= coupon.usage_limit:
            return CouponApplyResponse(
                success=False,
                message="This coupon has reached its usage limit."
            )

        # ---- Check if user already used this coupon ----
        already_used = db.query(CouponUsage).filter(
            CouponUsage.coupon_id == coupon.id,
            CouponUsage.user_id == current_user.id
        ).first()

        if already_used:
            return CouponApplyResponse(
                success=False,
                message="You have already used this coupon."
            )

        # ---- Check minimum order value ----
        min_order = float(coupon.min_order_value) if coupon.min_order_value else 0
        if cart_total < min_order:
            return CouponApplyResponse(
                success=False,
                message=f"Minimum order value is ₹{min_order:.0f} to use this coupon. Add ₹{(min_order - cart_total):.0f} more."
            )

        # ---- Calculate discount ----
        discount_amount = 0.0

        if coupon.discount_type == "percentage":
            discount_amount = (cart_total * float(coupon.discount_value)) / 100

            # Apply max discount cap
            if coupon.max_discount:
                max_disc = float(coupon.max_discount)
                if discount_amount > max_disc:
                    discount_amount = max_disc
        else:
            # Fixed discount
            discount_amount = float(coupon.discount_value)

        # Discount should not exceed cart total
        if discount_amount > cart_total:
            discount_amount = cart_total

        final_total = cart_total - discount_amount

        return CouponApplyResponse(
            success=True,
            message=f"Coupon '{code}' applied successfully! You save ₹{discount_amount:.0f}",
            coupon_code=code,
            discount_type=coupon.discount_type,
            discount_value=float(coupon.discount_value),
            discount_amount=round(discount_amount, 2),
            min_order_value=min_order,
            final_total=round(final_total, 2)
        )

    except Exception as e:
        print(f"Apply Coupon Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply coupon: {str(e)}"
        )


# ============================================
# REMOVE COUPON
# ============================================
@router.post("/remove")
async def remove_coupon(
    current_user: User = Depends(get_current_user)
):
    """Coupon remove करा"""
    return {
        "success": True,
        "message": "Coupon removed successfully"
    }


# ============================================
# GET AVAILABLE COUPONS (User)
# ============================================
@router.get("/available")
async def get_available_coupons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """User ला available coupons दाखवा"""
    try:
        coupons = db.query(Coupon).filter(
            Coupon.is_active == True,
            Coupon.used_count < Coupon.usage_limit
        ).all()

        available = []
        for coupon in coupons:
            # Check expiry
            if coupon.expires_at and coupon.expires_at < datetime.now():
                continue

            # Check if user already used
            already_used = db.query(CouponUsage).filter(
                CouponUsage.coupon_id == coupon.id,
                CouponUsage.user_id == current_user.id
            ).first()

            if already_used:
                continue

            available.append({
                "id": coupon.id,
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": float(coupon.discount_value),
                "min_order_value": float(coupon.min_order_value) if coupon.min_order_value else 0,
                "max_discount": float(coupon.max_discount) if coupon.max_discount else None,
                "expires_at": coupon.expires_at.isoformat() if coupon.expires_at else None,
                "description": _get_coupon_description(coupon)
            })

        return {
            "success": True,
            "coupons": available
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


def _get_coupon_description(coupon):
    """Coupon चं readable description"""
    if coupon.discount_type == "percentage":
        desc = f"{int(coupon.discount_value)}% off"
        if coupon.max_discount:
            desc += f" (up to ₹{int(coupon.max_discount)})"
    else:
        desc = f"₹{int(coupon.discount_value)} off"

    if coupon.min_order_value and float(coupon.min_order_value) > 0:
        desc += f" on orders above ₹{int(coupon.min_order_value)}"

    return desc


# ============================================
# ADMIN: GET ALL COUPONS
# ============================================
@router.get("/admin/all")
async def get_all_coupons(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Get all coupons"""
    coupons = db.query(Coupon).all()
    return [{
        "id": c.id,
        "code": c.code,
        "discount_type": c.discount_type,
        "discount_value": float(c.discount_value),
        "min_order_value": float(c.min_order_value) if c.min_order_value else 0,
        "max_discount": float(c.max_discount) if c.max_discount else None,
        "usage_limit": c.usage_limit,
        "used_count": c.used_count,
        "is_active": c.is_active,
        "expires_at": c.expires_at.isoformat() if c.expires_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None
    } for c in coupons]


# ============================================
# ADMIN: CREATE COUPON
# ============================================
@router.post("/admin/create")
async def create_coupon(
    code: str,
    discount_type: str = "percentage",
    discount_value: float = 10,
    min_order_value: float = 0,
    max_discount: float = None,
    usage_limit: int = 100,
    expires_at: str = None,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Create new coupon"""
    try:
        existing = db.query(Coupon).filter(Coupon.code == code.upper()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")

        new_coupon = Coupon(
            code=code.upper(),
            discount_type=discount_type,
            discount_value=discount_value,
            min_order_value=min_order_value,
            max_discount=max_discount,
            usage_limit=usage_limit,
            expires_at=datetime.fromisoformat(expires_at) if expires_at else None
        )

        db.add(new_coupon)
        db.commit()

        return {"success": True, "message": f"Coupon '{code.upper()}' created!"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# ADMIN: DELETE COUPON
# ============================================
@router.delete("/admin/{coupon_id}")
async def delete_coupon(
    coupon_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Delete coupon"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    db.delete(coupon)
    db.commit()
    return {"success": True, "message": "Coupon deleted"}

# ============================================
# ADMIN: UPDATE COUPON
# ============================================
@router.put("/admin/{coupon_id}")
async def update_coupon(
    coupon_id: int,
    data: dict,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Update coupon"""
    try:
        coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")

        if "code" in data:
            # Check if code already exists (different coupon)
            existing = db.query(Coupon).filter(
                Coupon.code == data["code"].upper(),
                Coupon.id != coupon_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Coupon code already exists")
            coupon.code = data["code"].upper()

        if "discount_type" in data:
            coupon.discount_type = data["discount_type"]
        if "discount_value" in data:
            coupon.discount_value = data["discount_value"]
        if "min_order_value" in data:
            coupon.min_order_value = data["min_order_value"]
        if "max_discount" in data:
            coupon.max_discount = data["max_discount"]
        if "usage_limit" in data:
            coupon.usage_limit = data["usage_limit"]
        if "is_active" in data:
            coupon.is_active = data["is_active"]
        if "expires_at" in data:
            if data["expires_at"]:
                coupon.expires_at = datetime.fromisoformat(str(data["expires_at"]))
            else:
                coupon.expires_at = None

        db.commit()
        return {"success": True, "message": "Coupon updated!"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))