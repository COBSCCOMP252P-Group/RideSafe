from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
import enum
from models.user import Base

class BusStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class Bus(Base):
    __tablename__ = "buses"
    
    bus_id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(20), unique=True, nullable=False, index=True)
    capacity = Column(Integer)
    status = Column(String(20), default=BusStatus.ACTIVE)
    
    # Relationships
    route = relationship("Route", back_populates="bus", uselist=False, cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="bus", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", back_populates="bus", cascade="all, delete-orphan")

    