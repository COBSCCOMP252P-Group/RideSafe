from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False, unique=True, index=True)
    full_name = Column(String, nullable=False)

    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    password_hash = Column(Text, nullable=False)

    role = Column(String, nullable=False)   # ADMIN / DRIVER / PARENT
    status = Column(String, default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())