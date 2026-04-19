from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Time
from sqlalchemy.orm import relationship
from models.base import Base

class RouteStop(Base):
    __tablename__ = "route_stops"
    
    stop_id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.route_id", ondelete="CASCADE"))
    stop_name = Column(String(100))
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    stop_order = Column(Integer)
    expected_time = Column(Time, nullable=True)  # Expected arrival time at this stop