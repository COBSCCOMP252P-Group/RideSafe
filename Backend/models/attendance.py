from xmlrpc.client import Boolean

from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from models.user import Base

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    NO_SHOW = "NO_SHOW"

class Attendance(Base):
    __tablename__ = "attendance"
    
    attendance_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    bus_id = Column(Integer, ForeignKey("buses.bus_id"), nullable=False)
    date = Column(Date, nullable=False,default=func.current_date())


    check_in_time = Column(Time, nullable=True, default=func.current_time())
    check_out_time = Column(Time, nullable=True, default=func.current_time())

    status = Column(Enum(AttendanceStatus)), default=AttendanceStatus.ABSENT
    is_late =Column(Boolean,default=False)
    is_no_show = Column(Boolean,default=False)
    expected_arrival_time = Column(Time, nullable=True)
    
    created_at = Column(Date, default=func.current_date())
    
    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    bus = relationship("Bus", back_populates="attendance_records")