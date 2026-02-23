from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    role = Column(Enum("superadmin", "admin", "moderator"), default="admin")
    is_active = Column(Boolean, default=True)
    last_login = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())