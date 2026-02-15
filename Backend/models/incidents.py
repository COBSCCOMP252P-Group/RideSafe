from sqlalchemy import Column, Integer, String, ForeignKey, Text, Enum, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from models.user import Base

class IncidentType(str, enum.Enum):
    DELAY = "DELAY"
    INCIDENT = "INCIDENT"

class Incident(Base):
    __tablename__ = "incidents"
    
    incident_id = Column(Integer, primary_key=True, index=True)
    reported_by = Column(Integer, ForeignKey("drivers.driver_id"))
    route_id = Column(Integer, ForeignKey("routes.route_id"))
    description = Column(Text)
    type = Column(Enum(IncidentType))
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    driver = relationship("Driver", back_populates="reported_incidents")
    route = relationship("Route", back_populates="incidents")