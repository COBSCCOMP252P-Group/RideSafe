from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from models.base import Base

class RegisterRequest(Base):
    __tablename__ = "register_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    parent_name = Column(Text, nullable=False)
    email = Column(Text, nullable=True)
    phone_number = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    student_index = Column(Text, nullable=False)
    student_name = Column(Text, nullable=True)
    student_grade = Column(Text, nullable=True)
    request_status = Column(Text, nullable=True, default="pending")
