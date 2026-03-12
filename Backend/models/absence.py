from click import DateTime
from wrapt import Boolean

from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from models.user import Base

class AbsenceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Absence(Base):
    __tablename__ = "absences"
    
    absence_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    date = Column(Date)
    reason = Column(Text)
    status = Column(String(20), default=AbsenceStatus.PENDING)

    approved_by = Column(Integer, ForeignKey("users.user_id"))
    approval_date=Column(DateTime, nullable=True)

    reported_at =Column(DateTime,default=func.now())
    is_excused = Column(Boolean, default=False)

    
    # Relationships
    student = relationship("Student", back_populates="absences")
    approved_by_user = relationship("User")