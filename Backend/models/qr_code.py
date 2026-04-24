from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.base import Base

class QRCode(Base):
    __tablename__ = "qr_codes"
    
    qr_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, unique=True)
    qr_token = Column(String(100), unique=True, nullable=False)  # Simple token/ID
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=True)  # Optional expiry
    
    # Relationship
    student = relationship("Student", back_populates="qr_code")