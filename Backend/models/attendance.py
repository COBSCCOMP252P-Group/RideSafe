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
    student_id = Column(Integer, ForeignKey("students.student_id"))
    bus_id = Column(Integer, ForeignKey("buses.bus_id"))
    date = Column(Date, nullable=False)
    check_in_time = Column(Time)
    check_out_time = Column(Time)
    status = Column(Enum(AttendanceStatus))
    
    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    bus = relationship("Bus", back_populates="attendance_records")