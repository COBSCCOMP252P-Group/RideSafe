from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from models.base import Base
from sqlalchemy.orm import relationship


class StudentFixedLocation(Base):
    __tablename__ = "student_fixed_location"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=True)
    location_id = Column(Integer, nullable=True)
    type = Column(String, nullable=True)