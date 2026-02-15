from sqlalchemy import Column, Integer, String, Date, Time, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from models.user import Base

class RouteHistory(Base):
    __tablename__ = "route_history"
    
    history_id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.route_id"))
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    distance = Column(DECIMAL(6, 2))
    
    # Relationship
    route = relationship("Route", back_populates="history")