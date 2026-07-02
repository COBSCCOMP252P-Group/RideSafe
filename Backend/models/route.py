from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base

class Route(Base):
    __tablename__ = "routes"
    
    route_id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100))
    bus_id = Column(Integer, ForeignKey("buses.bus_id"), unique=True)
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    start_point_location = Column(Integer)
    end_point_location = Column(Integer)
    type = Column(String(100))