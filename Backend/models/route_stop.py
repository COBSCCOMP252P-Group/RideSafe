from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from models.user import Base

class RouteStop(Base):
    __tablename__ = "route_stops"
    
    stop_id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.route_id", ondelete="CASCADE"))
    stop_name = Column(String(100))
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    stop_order = Column(Integer)

    # Relationships
    route = relationship("Route", back_populates="stops")
    pickup_students = relationship("StudentRoute", foreign_keys="[StudentRoute.pickup_stop_id]", back_populates="pickup_stop")
    dropoff_students = relationship("StudentRoute", foreign_keys="[StudentRoute.dropoff_stop_id]", back_populates="dropoff_stop")