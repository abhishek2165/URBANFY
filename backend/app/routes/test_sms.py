from fastapi import APIRouter
import os

router = APIRouter(prefix="/test", tags=["Test"])


@router.get("/sms/{phone}")
async def test_sms(phone: str):
    """Test SMS - Delete after testing"""

    api_key = os.getenv("FAST2SMS_API_KEY", "NOT SET")
    sms_enabled = os.getenv("SMS_ENABLED", "NOT SET")
    admin_phone = os.getenv("ADMIN_PHONE", "NOT SET")

    env_status = {
        "FAST2SMS_API_KEY": "SET ✅" if api_key and api_key != "your_fast2sms_api_key_here" and len(api_key) > 10 else f"NOT SET ❌",
        "SMS_ENABLED": sms_enabled,
        "ADMIN_PHONE": admin_phone,
        "API_KEY_LENGTH": len(api_key) if api_key else 0,
    }

    try:
        from app.utils.sms_service import send_sms
        result = await send_sms(
            phone, 
            "URBUNFY TEST: SMS service is working! Ignore this message."
        )

        return {
            "status": "Test Complete",
            "env_status": env_status,
            "sms_result": result,
            "phone_sent_to": phone,
        }
    except ImportError as e:
        return {
            "status": "IMPORT ERROR",
            "error": str(e),
            "env_status": env_status,
            "fix": "sms_service.py file nahi aahe! Create kara backend/app/utils/sms_service.py"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "error": str(e),
            "env_status": env_status,
        }


@router.get("/check-files")
async def check_files():
    """Check if all SMS files exist"""
    import os

    files_to_check = {
        "sms_service.py": os.path.exists("app/utils/sms_service.py"),
        "utils/__init__.py": os.path.exists("app/utils/__init__.py"),
        ".env": os.path.exists(".env"),
    }

    env_vars = {
        "FAST2SMS_API_KEY": bool(os.getenv("FAST2SMS_API_KEY")),
        "ADMIN_PHONE": os.getenv("ADMIN_PHONE", "NOT SET"),
        "SMS_ENABLED": os.getenv("SMS_ENABLED", "NOT SET"),
    }

    # Check httpx installed
    try:
        import httpx
        httpx_installed = True
    except ImportError:
        httpx_installed = False

    return {
        "files_exist": files_to_check,
        "env_vars": env_vars,
        "httpx_installed": httpx_installed,
    }