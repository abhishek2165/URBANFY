from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
import random
import string
import asyncio
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.cart import Cart
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderListResponse,
    OrderStatusUpdate,
)
from app.middleware.auth_middleware import get_current_user, get_current_admin
from app.models.coupon import Coupon, CouponUsage
from app.utils.sms_service import (
    send_order_confirmation_to_user,
    send_order_notification_to_admin,
    send_order_status_update,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


# ============================================
# TEST SMS ROUTE - Testing sathi
# ============================================
@router.get("/test-sms/{phone}")
async def test_sms(phone: str):
    """Test SMS sending - delete after testing"""
    
    import os
    
    api_key = os.getenv("FAST2SMS_API_KEY", "NOT SET")
    sms_enabled = os.getenv("SMS_ENABLED", "NOT SET")
    admin_phone = os.getenv("ADMIN_PHONE", "NOT SET")
    
    # First check env variables
    env_status = {
        "FAST2SMS_API_KEY": "SET ✅" if api_key != "NOT SET" and api_key != "your_fast2sms_api_key_here" and len(api_key) > 10 else f"NOT SET ❌ (value: {api_key[:20]}...)",
        "SMS_ENABLED": sms_enabled,
        "ADMIN_PHONE": admin_phone,
    }
    
    # Try sending test SMS
    try:
        from app.utils.sms_service import send_sms
        result = await send_sms(phone, "URBUNFY TEST: SMS service is working! Ignore this message.")
        
        return {
            "env_status": env_status,
            "sms_result": result,
            "phone_sent_to": phone,
            "message": "Check above for details"
        }
    except Exception as e:
        return {
            "env_status": env_status,
            "error": str(e),
            "message": "SMS sending failed - check error"
        }


# ============================================
# HELPER: Generate order number
# ============================================
def generate_order_number():
    timestamp = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"URB-{timestamp}-{random_str}"


# ============================================
# HELPER: Calculate expected delivery date
# ============================================
def calculate_expected_delivery(city: str = None, state: str = None):
    """
    Calculate expected delivery date based on location
    - Same state: 3-5 days
    - Metro cities: 4-6 days
    - Other: 5-7 days
    """
    today = datetime.now().date()

    metro_cities = [
        "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad",
        "chennai", "kolkata", "pune", "ahmedabad", "jaipur",
        "lucknow", "nagpur", "indore", "bhopal", "surat"
    ]

    city_lower = (city or "").lower().strip()

    if city_lower in metro_cities:
        delivery_days = random.randint(4, 6)
    elif state and state.lower().strip() in ["maharashtra", "karnataka", "delhi"]:
        delivery_days = random.randint(3, 5)
    else:
        delivery_days = random.randint(5, 7)

    expected_date = today + timedelta(days=delivery_days)

    # Skip Sunday
    if expected_date.weekday() == 6:
        expected_date += timedelta(days=1)

    return expected_date


# ============================================
# HELPER: Format date for display
# ============================================
def format_date(date_obj):
    """Format date like: Mon, 15 Jul 2025"""
    if not date_obj:
        return None
    return date_obj.strftime("%a, %d %b %Y")


# ============================================
# HELPER: Build order response
# ============================================
def build_order_response(order):
    items = []
    for item in order.items:
        items.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_image=item.product_image,
            price=float(item.price),
            quantity=item.quantity,
            total=float(item.total)
        ))

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        total_price=float(order.total_price),
        discount_amount=float(order.discount_amount) if order.discount_amount else 0.0,
        shipping_charge=float(order.shipping_charge) if order.shipping_charge else 0.0,
        final_price=float(order.final_price),
        address=order.address,
        city=order.city,
        state=order.state,
        pincode=order.pincode,
        phone=order.phone,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        notes=order.notes,
        items=items,
        created_at=order.created_at,
        # ⬅️ NEW: Expected Delivery
        expected_delivery=order.expected_delivery,
        expected_delivery_formatted=format_date(order.expected_delivery),
        # Razorpay
        razorpay_order_id=order.razorpay_order_id,
        razorpay_payment_id=order.razorpay_payment_id,
    )


# ============================================
# PLACE ORDER (from cart) - WITH SMS + EXPECTED DATE
# ============================================
@router.post("/place", response_model=OrderResponse)
async def place_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Place order from cart items - WITH COUPON, SMS & EXPECTED DATE"""

    try:
        # Get cart items
        cart_items = db.query(Cart).filter(
            Cart.user_id == current_user.id
        ).all()

        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty. Add products before placing order."
            )

        # Calculate total
        total_price = 0.0
        order_items_data = []
        total_items_count = 0

        for cart_item in cart_items:
            product = cart_item.product

            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{cart_item.product_id}' is no longer available"
                )

            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"'{product.name}' has only {product.stock} items in stock"
                )

            price = float(product.discount_price) if product.discount_price else float(product.price)
            item_total = price * cart_item.quantity
            total_price += item_total
            total_items_count += cart_item.quantity

            order_items_data.append({
                "product": product,
                "price": price,
                "quantity": cart_item.quantity,
                "total": item_total
            })

        # ===== COUPON DISCOUNT CALCULATION =====
        discount_amount = 0.0
        coupon = None
        coupon_code = None

        if order_data.coupon_code:
            coupon_code = order_data.coupon_code.strip().upper()
            coupon = db.query(Coupon).filter(
                Coupon.code == coupon_code,
                Coupon.is_active == True
            ).first()

            if coupon:
                if coupon.expires_at and coupon.expires_at < datetime.now():
                    coupon = None
                elif coupon.used_count >= coupon.usage_limit:
                    coupon = None
                elif float(coupon.min_order_value or 0) > total_price:
                    coupon = None
                else:
                    already_used = db.query(CouponUsage).filter(
                        CouponUsage.coupon_id == coupon.id,
                        CouponUsage.user_id == current_user.id
                    ).first()

                    if already_used:
                        coupon = None
                    else:
                        if coupon.discount_type == "percentage":
                            discount_amount = (total_price * float(coupon.discount_value)) / 100
                            if coupon.max_discount:
                                discount_amount = min(discount_amount, float(coupon.max_discount))
                        else:
                            discount_amount = float(coupon.discount_value)

                        discount_amount = min(discount_amount, total_price)

        # Shipping charge
        shipping_charge = 0.0 if total_price >= 999 else 49.0

        # Final price
        final_price = total_price - discount_amount + shipping_charge

        # Generate order number
        order_number = generate_order_number()

        # ⬅️ NEW: Calculate expected delivery date
        expected_delivery = calculate_expected_delivery(
            city=order_data.city,
            state=order_data.state
        )

        # Create order
        new_order = Order(
            user_id=current_user.id,
            order_number=order_number,
            total_price=total_price,
            discount_amount=discount_amount,
            shipping_charge=shipping_charge,
            final_price=final_price,
            address=order_data.address,
            city=order_data.city,
            state=order_data.state,
            pincode=order_data.pincode,
            phone=order_data.phone or "8999323926",
            payment_method=order_data.payment_method or "COD",
            payment_status="Pending",
            order_status="Pending",
            notes=order_data.notes,
            coupon_code=coupon_code if coupon else None,
            expected_delivery=expected_delivery,  # ⬅️ NEW
        )

        db.add(new_order)
        db.flush()

        # Create order items & reduce stock
        for item_data in order_items_data:
            product = item_data["product"]
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                product_name=product.name,
                product_image=product.image_url,
                price=item_data["price"],
                quantity=item_data["quantity"],
                total=item_data["total"]
            )
            db.add(order_item)
            product.stock -= item_data["quantity"]

        # Update coupon usage
        if coupon:
            coupon_usage = CouponUsage(
                coupon_id=coupon.id,
                user_id=current_user.id,
                order_id=new_order.id,
                discount_amount=discount_amount
            )
            db.add(coupon_usage)
            coupon.used_count += 1

        # Clear cart
        db.query(Cart).filter(Cart.user_id == current_user.id).delete()

        db.commit()
        db.refresh(new_order)

        # ⬅️⬅️⬅️ NEW: SEND SMS (Background - won't block response)
        try:
            expected_date_str = format_date(expected_delivery)
            customer_name = f"{current_user.first_name} {current_user.last_name}"

            # SMS to Customer
            asyncio.create_task(
                send_order_confirmation_to_user(
                    phone=order_data.phone or current_user.phone,
                    order_number=order_number,
                    total=final_price,
                    expected_date=expected_date_str,
                    payment_method=order_data.payment_method or "COD"
                )
            )

            # SMS to Admin
            asyncio.create_task(
                send_order_notification_to_admin(
                    order_number=order_number,
                    customer_name=customer_name,
                    customer_phone=order_data.phone or current_user.phone,
                    total=final_price,
                    payment_method=order_data.payment_method or "COD",
                    items_count=total_items_count,
                    city=order_data.city or ""
                )
            )

            print(f"[SMS] Triggered for order {order_number}")

        except Exception as sms_error:
            # SMS fail zala tari order success rahil
            print(f"[SMS ERROR] {str(sms_error)} - Order still placed successfully")

        return build_order_response(new_order)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Place Order Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to place order: {str(e)}"
        )


# ============================================
# GET MY ORDERS
# ============================================
@router.get("/my", response_model=OrderListResponse)
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's orders"""

    try:
        orders = db.query(Order).filter(
            Order.user_id == current_user.id
        ).order_by(desc(Order.created_at)).all()

        order_list = []
        for order in orders:
            order_list.append(build_order_response(order))

        return OrderListResponse(
            success=True,
            total=len(order_list),
            orders=order_list
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}"
        )


# ============================================
# GET ORDER BY ID
# ============================================
@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get order details by ID"""

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return build_order_response(order)


# ============================================
# ADMIN: GET ALL ORDERS
# ============================================
@router.get("/admin/all", response_model=OrderListResponse)
async def get_all_orders(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Get all orders"""

    try:
        orders = db.query(Order).order_by(desc(Order.created_at)).all()

        order_list = []
        for order in orders:
            order_list.append(build_order_response(order))

        return OrderListResponse(
            success=True,
            total=len(order_list),
            orders=order_list
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}"
        )


# ============================================
# ADMIN: UPDATE ORDER STATUS - WITH SMS
# ============================================
@router.put("/admin/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: Update order status - Sends SMS to customer"""

    try:
        order = db.query(Order).filter(Order.id == order_id).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        old_status = order.order_status

        if status_data.order_status:
            valid_statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
            if status_data.order_status not in valid_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status. Must be: {', '.join(valid_statuses)}"
                )
            order.order_status = status_data.order_status

        if status_data.payment_status:
            valid_payment = ["Pending", "Paid", "Failed", "Refunded"]
            if status_data.payment_status not in valid_payment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid payment status. Must be: {', '.join(valid_payment)}"
                )
            order.payment_status = status_data.payment_status

        # ⬅️ NEW: If cancelled, restore stock
        if status_data.order_status == "Cancelled" and old_status != "Cancelled":
            for item in order.items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock += item.quantity
                    print(f"[STOCK RESTORED] {product.name}: +{item.quantity}")

        db.commit()
        db.refresh(order)

        # ⬅️ NEW: Send SMS on status change
        if status_data.order_status and status_data.order_status != old_status:
            try:
                expected_date_str = format_date(order.expected_delivery)

                asyncio.create_task(
                    send_order_status_update(
                        phone=order.phone,
                        order_number=order.order_number,
                        status=status_data.order_status,
                        expected_date=expected_date_str
                    )
                )
                print(f"[SMS] Status update sent for {order.order_number}: {status_data.order_status}")

            except Exception as sms_error:
                print(f"[SMS ERROR] Status update SMS failed: {str(sms_error)}")

        return build_order_response(order)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )