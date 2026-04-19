from sqlalchemy import Column, Integer, ForeignKey, Date, DateTime, Text, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from models.base import Base

class AbsenceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Absence(Base):
    __tablename__ = "absences"

    absence_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)

    # Status and approval
    status = Column(Enum(AbsenceStatus), default=AbsenceStatus.PENDING)

    # Approval tracking
    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    approval_date = Column(DateTime, nullable=True)

    # Metadata
    reported_at = Column(DateTime, default=func.now())
    is_excused = Column(Boolean, default=False)

  