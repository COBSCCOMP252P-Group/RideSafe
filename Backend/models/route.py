from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.user import Base

class Route(Base):
    __tablename__ = "routes"
    
    route_id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100))
    start_point = Column(String(100))
    end_point = Column(String(100))
    bus_id = Column(Integer, ForeignKey("buses.bus_id"), unique=True)
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    
    # Relationships
    bus = relationship("Bus", back_populates="route")
    driver = relationship("Driver", back_populates="assigned_route")
    stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan")
    student_routes = relationship("StudentRoute", back_populates="route", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="route", cascade="all, delete-orphan")
    history = relationship("RouteHistory", back_populates="route", cascade="all, delete-orphan")