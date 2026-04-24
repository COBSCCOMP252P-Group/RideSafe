from sqlalchemy import Column, Integer, String, DateTime, Numeric
from sqlalchemy.sql import func
from models.base import Base


class Location(Base):
    __tablename__ = "location"

    location_id = Column(Integer, primary_key=True, index=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)