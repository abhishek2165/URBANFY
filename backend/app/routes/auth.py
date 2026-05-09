from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserSignup,
    UserLogin,
    UserResponse,
    AuthResponse,
    UserUpdate,
    ChangePassword,
)
from app.utils.auth import hash_password, verify_password, create_access_token
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================
# SIGNUP
# ============================================
@router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """Register a new user"""

    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        hashed_pw = hash_password(user_data.password)

        # Create new user
        new_user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            password_hash=hashed_pw,
            phone=user_data.phone if user_data.phone else "8999323926",
            role="user",
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create JWT token
        token = create_access_token(
            data={"user_id": new_user.id, "email": new_user.email}
        )

        # Build response
        user_response = UserResponse(
            id=new_user.id,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            email=new_user.email,
            phone=new_user.phone,
            address=new_user.address,
            city=new_user.city,
            state=new_user.state,
            pincode=new_user.pincode,
            role=new_user.role,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )

        return AuthResponse(
            success=True,
            message="Account created successfully!",
            token=token,
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Signup Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


# ============================================
# LOGIN
# ============================================
@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""

    try:
        # Find user by email
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check if active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact support."
            )

        # Create JWT token
        token = create_access_token(
            data={"user_id": user.id, "email": user.email}
        )

        user_response = UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            address=user.address,
            city=user.city,
            state=user.state,
            pincode=user.pincode,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )

        return AuthResponse(
            success=True,
            message="Login successful!",
            token=token,
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


# ============================================
# GET CURRENT USER PROFILE
# ============================================
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current logged-in user profile"""

    return UserResponse(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        phone=current_user.phone,
        address=current_user.address,
        city=current_user.city,
        state=current_user.state,
        pincode=current_user.pincode,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


# ============================================
# UPDATE PROFILE
# ============================================
@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""

    try:
        if update_data.first_name is not None:
            current_user.first_name = update_data.first_name
        if update_data.last_name is not None:
            current_user.last_name = update_data.last_name
        if update_data.phone is not None:
            current_user.phone = update_data.phone
        if update_data.address is not None:
            current_user.address = update_data.address
        if update_data.city is not None:
            current_user.city = update_data.city
        if update_data.state is not None:
            current_user.state = update_data.state
        if update_data.pincode is not None:
            current_user.pincode = update_data.pincode

        db.commit()
        db.refresh(current_user)

        return UserResponse(
            id=current_user.id,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            email=current_user.email,
            phone=current_user.phone,
            address=current_user.address,
            city=current_user.city,
            state=current_user.state,
            pincode=current_user.pincode,
            role=current_user.role,
            is_active=current_user.is_active,
            created_at=current_user.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update failed: {str(e)}"
        )


# ============================================
# CHANGE PASSWORD
# ============================================
@router.put("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""

    try:
        if not verify_password(password_data.old_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        current_user.password_hash = hash_password(password_data.new_password)
        db.commit()

        return {"success": True, "message": "Password changed successfully!"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.config import settings


# ============================================
# PASSWORD FUNCTIONS (Direct bcrypt)
# ============================================
def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


# ============================================
# JWT TOKEN FUNCTIONS
# ============================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# ============================================
# ADMIN JWT TOKEN FUNCTIONS
# ============================================
def create_admin_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ADMIN_JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire, "is_admin": True})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.ADMIN_JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_admin_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.ADMIN_JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("is_admin"):
            return payload
        return None
    except JWTError:
        return None

@router.get("/test-sms")
async def test_sms():
    from app.utils.helpers import send_sms
    result = await send_sms("YOUR_10_DIGIT_NUMBER", "URBANFY: Test SMS working!")
    return result                