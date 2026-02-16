from sqlalchemy import Column, Integer, DECIMAL, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.user import Base

class SOSAlert(Base):
    __tablename__ = "sos_alerts"
    
    sos_id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    bus_id = Column(Integer, ForeignKey("buses.bus_id"))
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_status = Column(Boolean, default=False)
    
    # Relationships
    driver = relationship("Driver", back_populates="sos_alerts")
    bus = relationship("Bus", back_populates="sos_alerts")