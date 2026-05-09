import httpx
import os
from datetime import datetime

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY", "")
ADMIN_PHONE = os.getenv("ADMIN_PHONE", "8999323926")
SMS_ENABLED = os.getenv("SMS_ENABLED", "True").lower() == "true"


async def send_sms(phone: str, message: str):
    """Send SMS using Fast2SMS API"""

    if not SMS_ENABLED:
        print(f"[SMS DISABLED] To: {phone} | Message: {message}")
        return {"success": False, "reason": "SMS disabled"}

    if not FAST2SMS_API_KEY:
        print(f"[SMS ERROR] API Key not configured")
        return {"success": False, "reason": "API key missing"}

    # Phone number clean kar
    phone = phone.strip().replace(" ", "").replace("+91", "")
    if len(phone) > 10:
        phone = phone[-10:]

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"

        headers = {
            "authorization": FAST2SMS_API_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "route": "v",
            "message": message,
            "language": "english",
            "flash": 0,
            "numbers": phone
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            result = response.json()

        print(f"[SMS SENT] To: {phone} | Status: {result}")
        return {"success": True, "response": result}

    except Exception as e:
        print(f"[SMS ERROR] To: {phone} | Error: {str(e)}")
        return {"success": False, "reason": str(e)}


# ============================================
# SMS TEMPLATES
# ============================================

async def send_order_confirmation_to_user(
    phone: str,
    order_number: str,
    total: float,
    expected_date: str,
    payment_method: str
):
    """Order confirmation SMS to customer"""

    message = (
        f"URBANFY: Your order {order_number} is confirmed! "
        f"Amount: Rs.{total:.0f} ({payment_method}). "
        f"Expected delivery: {expected_date}. "
        f"Track your order at urbunfy.com. Thank you for shopping!"
    )

    return await send_sms(phone, message)


async def send_order_notification_to_admin(
    order_number: str,
    customer_name: str,
    customer_phone: str,
    total: float,
    payment_method: str,
    items_count: int,
    city: str = ""
):
    """New order notification SMS to admin"""

    message = (
        f"URBANFY NEW ORDER! #{order_number} | "
        f"Customer: {customer_name} ({customer_phone}) | "
        f"Amount: Rs.{total:.0f} ({payment_method}) | "
        f"Items: {items_count} | City: {city}. "
        f"Check admin panel for details."
    )

    return await send_sms(ADMIN_PHONE, message)


async def send_order_status_update(
    phone: str,
    order_number: str,
    status: str,
    expected_date: str = None
):
    """Order status update SMS to customer"""

    status_messages = {
        "Confirmed": f"URBANFY: Your order {order_number} is confirmed and being processed!",
        "Shipped": f"URBANFY: Your order {order_number} has been shipped! Expected delivery: {expected_date or 'soon'}.",
        "Delivered": f"URBANFY: Your order {order_number} has been delivered! Thank you for shopping with us! 🎉",
        "Cancelled": f"URBANFY: Your order {order_number} has been cancelled. Refund will be processed within 5-7 days.",
    }

    message = status_messages.get(
        status,
        f"URBANFY: Your order {order_number} status updated to: {status}"
    )

    return await send_sms(phone, message)


async def send_payment_success_sms(
    phone: str,
    order_number: str,
    amount: float,
    transaction_id: str
):
    """Payment success SMS"""

    message = (
        f"URBANFY: Payment of Rs.{amount:.0f} received for order {order_number}. "
        f"Transaction ID: {transaction_id}. Thank you!"
    )

    return await send_sms(phone, message)