from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import razorpay
import hmac
import hashlib

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.cart import Cart
from app.models.product import Product
from app.models.user import User
from app.config import settings
from app.middleware.auth_middleware import get_current_user
from app.schemas.order import (
    OrderCreate,
    RazorpayOrderResponse,
    RazorpayVerifyRequest,
    OrderResponse,
    OrderItemResponse,
)

from datetime import datetime
import random
import string

from app.models.coupon import Coupon, CouponUsage

router = APIRouter(prefix="/payment", tags=["Payment"])

# ============================================
# Razorpay Client Initialize
# ============================================
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


# ============================================
# HELPER: Generate order number
# ============================================
def generate_order_number():
    timestamp = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"URB-{timestamp}-{random_str}"


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
        razorpay_order_id=order.razorpay_order_id,
        razorpay_payment_id=order.razorpay_payment_id,
        # ===== NEW =====
        expected_delivery=order.expected_delivery.isoformat() if order.expected_delivery else None,
        shipped_at=order.shipped_at,
        delivered_at=order.delivered_at,
        # ===============
    )


# ============================================
# STEP 1: CREATE RAZORPAY ORDER
# ============================================
@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # ---- Get cart items ----
        cart_items = db.query(Cart).filter(
            Cart.user_id == current_user.id
        ).all()

        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        # ---- Calculate total ----
        total_price = 0.0
        order_items_data = []

        for cart_item in cart_items:
            product = cart_item.product

            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{cart_item.product_id}' is not available"
                )

            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"'{product.name}' has only {product.stock} items in stock"
                )

            price = float(product.discount_price) if product.discount_price else float(product.price)
            item_total = price * cart_item.quantity
            total_price += item_total

            order_items_data.append({
                "product": product,
                "price": price,
                "quantity": cart_item.quantity,
                "total": item_total
            })

        # ---- COUPON DISCOUNT ----
        discount_amount = 0.0
        coupon = None
        coupon_code_value = None

        if order_data.coupon_code:
            coupon_code_value = order_data.coupon_code.strip().upper()
            coupon = db.query(Coupon).filter(
                Coupon.code == coupon_code_value,
                Coupon.is_active == True
            ).first()

            if coupon:
                # Check expiry
                if coupon.expires_at and coupon.expires_at < datetime.now():
                    coupon = None
                elif coupon.used_count >= coupon.usage_limit:
                    coupon = None
                elif float(coupon.min_order_value or 0) > total_price:
                    coupon = None
                else:
                    # Check if already used by this user
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

        # ---- Shipping ----
        shipping_charge = 0.0 if total_price >= 999 else 49.0

        # ---- FIX 1: discount minus केलं ----
        final_price = total_price - discount_amount + shipping_charge

        # ---- Create Razorpay Order ----
        amount_in_paise = int(final_price * 100)

        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "user_id": str(current_user.id),
                "user_email": current_user.email
            }
        })

        # ---- Save order in DB ----
        order_number = generate_order_number()

        # ---- FIX 2: discount_amount variable वापरला ----
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
            payment_method="Online",
            payment_status="Pending",
            order_status="Pending",
            notes=order_data.notes,
            razorpay_order_id=razorpay_order["id"],
            coupon_code=coupon_code_value if coupon else None,
        )

        db.add(new_order)
        db.flush()

        # ---- Create order items ----
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

        db.commit()

        return RazorpayOrderResponse(
            razorpay_order_id=razorpay_order["id"],
            amount=amount_in_paise,
            currency="INR",
            order_id=new_order.id,
            order_number=order_number,
            key_id=settings.RAZORPAY_KEY_ID
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Create Razorpay Order Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )


# ============================================
# STEP 2: VERIFY PAYMENT
# ============================================
@router.post("/verify")
async def verify_payment(
    verify_data: RazorpayVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # ---- Find order ----
        order = db.query(Order).filter(
            Order.id == verify_data.order_id,
            Order.user_id == current_user.id,
            Order.razorpay_order_id == verify_data.razorpay_order_id
        ).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # ---- Verify Signature ----
        message = f"{verify_data.razorpay_order_id}|{verify_data.razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != verify_data.razorpay_signature:
            order.payment_status = "Failed"
            db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed. Invalid signature."
            )

        # ---- Payment Verified! Update order ----
        order.razorpay_payment_id = verify_data.razorpay_payment_id
        order.razorpay_signature = verify_data.razorpay_signature
        order.payment_status = "Paid"
        order.order_status = "Confirmed"

        # ---- Reduce stock ----
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock -= item.quantity

        # ---- FIX 3: Coupon usage - return च्या आधी ----
        if order.coupon_code:
            coupon = db.query(Coupon).filter(Coupon.code == order.coupon_code).first()
            if coupon:
                coupon_usage = CouponUsage(
                    coupon_id=coupon.id,
                    user_id=current_user.id,
                    order_id=order.id,
                    discount_amount=float(order.discount_amount)
                )
                db.add(coupon_usage)
                coupon.used_count += 1

        # ---- Clear cart ----
        db.query(Cart).filter(Cart.user_id == current_user.id).delete()

        db.commit()
        db.refresh(order)

        # ---- return सगळ्यात शेवटी ----
        return {
            "success": True,
            "message": "Payment verified successfully!",
            "order": build_order_response(order)
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Verify Payment Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )


# ============================================
# STEP 3: PAYMENT FAILED
# ============================================
@router.post("/failed")
async def payment_failed(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == current_user.id
        ).first()

        if order:
            order.payment_status = "Failed"
            order.order_status = "Cancelled"
            db.commit()

        return {"success": True, "message": "Order marked as failed"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )