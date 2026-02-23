"""
SMS Test Script - Run this directly
Command: python test_sms_check.py
"""

import os
import asyncio
from dotenv import load_dotenv

# Load .env
load_dotenv()

print("=" * 50)
print("  URBUNFY SMS TEST")
print("=" * 50)
print()

# Step 1: Check ENV variables
print("📋 STEP 1: Checking .env variables...")
print("-" * 40)

api_key = os.getenv("FAST2SMS_API_KEY", "NOT SET")
admin_phone = os.getenv("ADMIN_PHONE", "NOT SET")
sms_enabled = os.getenv("SMS_ENABLED", "NOT SET")

print(f"  FAST2SMS_API_KEY: {'✅ SET (length: ' + str(len(api_key)) + ')' if api_key and api_key != 'NOT SET' and api_key != 'your_fast2sms_api_key_here' else '❌ NOT SET'}")
print(f"  ADMIN_PHONE: {admin_phone}")
print(f"  SMS_ENABLED: {sms_enabled}")
print()

if not api_key or api_key == "NOT SET" or api_key == "your_fast2sms_api_key_here":
    print("❌ ERROR: Fast2SMS API Key not configured!")
    print()
    print("FIX:")
    print("  1. Go to https://www.fast2sms.com")
    print("  2. Create free account")
    print("  3. Go to Dev API section")
    print("  4. Copy API Key")
    print("  5. Add to .env file:")
    print("     FAST2SMS_API_KEY=your_actual_key_here")
    print()
    exit()

# Step 2: Check httpx
print("📋 STEP 2: Checking httpx...")
print("-" * 40)
try:
    import httpx
    print(f"  httpx: ✅ Installed (version: {httpx.__version__})")
except ImportError:
    print("  httpx: ❌ NOT Installed")
    print("  FIX: Run 'pip install httpx'")
    exit()
print()

# Step 3: Check sms_service.py
print("📋 STEP 3: Checking sms_service.py...")
print("-" * 40)
if os.path.exists("app/utils/sms_service.py"):
    print("  sms_service.py: ✅ Exists")
else:
    print("  sms_service.py: ❌ NOT Found!")
    print("  FIX: Create file at backend/app/utils/sms_service.py")
    exit()
print()

# Step 4: Try importing
print("📋 STEP 4: Importing sms_service...")
print("-" * 40)
try:
    from app.utils.sms_service import send_sms
    print("  Import: ✅ Success")
except Exception as e:
    print(f"  Import: ❌ Failed - {str(e)}")
    exit()
print()

# Step 5: Send test SMS
print("📋 STEP 5: Sending test SMS...")
print("-" * 40)

phone = input("  Enter phone number to test (10 digits): ").strip()
if not phone:
    phone = admin_phone

print(f"  Sending to: {phone}")
print()


async def test():
    result = await send_sms(
        phone,
        "URBUNFY TEST: SMS working! Ignore this message."
    )
    return result


result = asyncio.run(test())

print()
print("📋 RESULT:")
print("-" * 40)
print(f"  {result}")
print()

if result.get("success"):
    print("✅ SMS SENT SUCCESSFULLY!")
    print("  Check your phone for the message.")
else:
    print("❌ SMS FAILED!")
    print(f"  Reason: {result.get('reason', 'Unknown')}")
    
    if "API key" in str(result.get("reason", "")):
        print()
        print("  FIX: Check your Fast2SMS API key")
    
print()
print("=" * 50)