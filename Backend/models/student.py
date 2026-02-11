from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from models.user import Base

class StudentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    grade = Column(String(20))
    parent_id = Column(Integer, ForeignKey("parents.parent_id"))
    status = Column(String(20), default=StudentStatus.ACTIVE)
    index_no = Column(String(50))
    
    # Relationships
    parent = relationship("Parent", back_populates="students")
    student_routes = relationship("StudentRoute", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    absences = relationship("Absence", back_populates="student", cascade="all, delete-orphan")