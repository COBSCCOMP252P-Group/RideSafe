from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from models.user import Base


class RegisterRequest(Base):
    __tablename__ = "register_requests"

    request_id = Column(Integer, primary_key=True, index=True)

    parent_name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    phone_number = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)

    student_index = Column(String(50))
    student_name = Column(String(100), nullable=False)
    student_grade = Column(String(20), nullable=False)

    request_status = Column(String(20), default="pending")

    created_at = Column(DateTime, default=datetime.utcnow)