from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.admin import AdminUser
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.review import Review
from app.models.category import Category
from app.utils.auth import verify_password, create_admin_token
from app.middleware.auth_middleware import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============================================
# ADMIN LOGIN SCHEMA
# ============================================
class AdminLogin(BaseModel):
    email: str
    password: str


class AdminResponse(BaseModel):
    success: bool
    message: str
    token: str
    admin: dict


# ============================================
# ADMIN LOGIN
# ============================================
@router.post("/login", response_model=AdminResponse)
async def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """Admin login"""

    try:
        admin = db.query(AdminUser).filter(
            AdminUser.email == login_data.email
        ).first()

        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not verify_password(login_data.password, admin.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is deactivated"
            )

        # Update last login
        admin.last_login = datetime.utcnow()
        db.commit()

        # Create admin token
        token = create_admin_token(
            data={"admin_id": admin.id, "email": admin.email, "role": admin.role}
        )

        return AdminResponse(
            success=True,
            message="Admin login successful!",
            token=token,
            admin={
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "full_name": admin.full_name,
                "role": admin.role
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Admin login failed: {str(e)}"
        )


# ============================================
# ADMIN DASHBOARD STATS
# ============================================
@router.get("/dashboard")
async def dashboard_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""

    try:
        total_products = db.query(func.count(Product.id)).scalar() or 0
        total_users = db.query(func.count(User.id)).scalar() or 0
        total_orders = db.query(func.count(Order.id)).scalar() or 0
        total_revenue = db.query(func.sum(Order.final_price)).filter(
            Order.order_status != "Cancelled"
        ).scalar() or 0.0
        total_reviews = db.query(func.count(Review.id)).scalar() or 0

        # Order status counts
        pending_orders = db.query(func.count(Order.id)).filter(
            Order.order_status == "Pending"
        ).scalar() or 0

        confirmed_orders = db.query(func.count(Order.id)).filter(
            Order.order_status == "Confirmed"
        ).scalar() or 0

        shipped_orders = db.query(func.count(Order.id)).filter(
            Order.order_status == "Shipped"
        ).scalar() or 0

        delivered_orders = db.query(func.count(Order.id)).filter(
            Order.order_status == "Delivered"
        ).scalar() or 0

        cancelled_orders = db.query(func.count(Order.id)).filter(
            Order.order_status == "Cancelled"
        ).scalar() or 0

        # Category wise products
        categories = db.query(Category).all()
        category_stats = []
        for cat in categories:
            count = db.query(func.count(Product.id)).filter(
                Product.category_id == cat.id
            ).scalar() or 0
            category_stats.append({
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "product_count": count
            })

        # Recent orders
        recent_orders = db.query(Order).order_by(
            desc(Order.created_at)
        ).limit(5).all()

        recent_list = []
        for order in recent_orders:
            user = db.query(User).filter(User.id == order.user_id).first()
            recent_list.append({
                "id": order.id,
                "order_number": order.order_number,
                "customer": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "total": float(order.final_price),
                "status": order.order_status,
                "date": str(order.created_at)
            })

        return {
            "success": True,
            "stats": {
                "total_products": total_products,
                "total_users": total_users,
                "total_orders": total_orders,
                "total_revenue": float(total_revenue),
                "total_reviews": total_reviews
            },
            "order_stats": {
                "pending": pending_orders,
                "confirmed": confirmed_orders,
                "shipped": shipped_orders,
                "delivered": delivered_orders,
                "cancelled": cancelled_orders
            },
            "category_stats": category_stats,
            "recent_orders": recent_list
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )


# ============================================
# ADMIN: GET ALL USERS
# ============================================
@router.get("/users")
async def get_all_users(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Get all users"""

    try:
        users = db.query(User).order_by(desc(User.created_at)).all()

        user_list = []
        for user in users:
            order_count = db.query(func.count(Order.id)).filter(
                Order.user_id == user.id
            ).scalar() or 0

            user_list.append({
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "city": user.city,
                "state": user.state,
                "role": user.role,
                "is_active": user.is_active,
                "total_orders": order_count,
                "created_at": str(user.created_at)
            })

        return {
            "success": True,
            "total": len(user_list),
            "users": user_list
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )


# ============================================
# ADMIN: GET USER DETAILS
# ============================================
@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Get user details with orders"""

    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        orders = db.query(Order).filter(
            Order.user_id == user_id
        ).order_by(desc(Order.created_at)).all()

        order_list = []
        for order in orders:
            order_list.append({
                "id": order.id,
                "order_number": order.order_number,
                "final_price": float(order.final_price),
                "order_status": order.order_status,
                "payment_method": order.payment_method,
                "created_at": str(order.created_at)
            })

        return {
            "success": True,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "address": user.address,
                "city": user.city,
                "state": user.state,
                "pincode": user.pincode,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": str(user.created_at)
            },
            "orders": order_list,
            "total_orders": len(order_list)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}"
        )


# ============================================
# ADMIN: TOGGLE USER STATUS
# ============================================
@router.put("/users/{user_id}/toggle")
async def toggle_user_status(
    user_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Activate/Deactivate user"""

    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user.is_active = not user.is_active
        db.commit()

        status_text = "activated" if user.is_active else "deactivated"

        return {
            "success": True,
            "message": f"User {user.first_name} {status_text} successfully",
            "is_active": user.is_active
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )