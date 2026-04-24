from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from models.base import Base

class StudentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    grade = Column(String(20))
    parent_id = Column(Integer, ForeignKey("parents.parent_id"))
    status = Column(String(20), default=StudentStatus.ACTIVE)
    index_no = Column(String(50))
    # Relationship to QR code
    qr_code = relationship("QRCode", back_populates="student", uselist=False)