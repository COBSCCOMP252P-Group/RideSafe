from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Enum, Boolean, Time
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
    route_id = Column(Integer, ForeignKey("routes.route_id"), nullable=False)
    date = Column(Date, nullable=False, default=func.current_date())

    # Check-in/out times
    check_in_time = Column(DateTime, nullable=True)  # When student boards
    check_out_time = Column(DateTime, nullable=True)  # When student exits

    # Status tracking
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.ABSENT)
    is_late = Column(Boolean, default=False)  # Boarded after schedule time
    is_no_show = Column(Boolean, default=False)  # Expected but didn't board
    expected_pickup_time = Column(Time, nullable=True)  # Expected time

    # Metadata
    created_at = Column(DateTime, default=func.now())

    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    bus = relationship("Bus", back_populates="attendance_records")
    route = relationship("Route", back_populates="attendance_records")
  