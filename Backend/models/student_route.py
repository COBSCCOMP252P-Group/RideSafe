from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base

class StudentRoute(Base):
    __tablename__ = "student_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"))
    route_id = Column(Integer, ForeignKey("routes.route_id"))
    pickup_stop_id = Column(Integer, ForeignKey("route_stops.stop_id"))
    dropoff_stop_id = Column(Integer, ForeignKey("route_stops.stop_id"))