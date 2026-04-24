from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.sql import func
from models.base import Base


class StudentTempLocation(Base):
    __tablename__ = "student_temp_location"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=True)
    location_id = Column(Integer, nullable=True)
    type = Column(String, nullable=True)
    date = Column(Date, nullable=True)