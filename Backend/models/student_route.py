from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.user import Base

class StudentRoute(Base):
    __tablename__ = "student_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"))
    route_id = Column(Integer, ForeignKey("routes.route_id"))
    pickup_stop_id = Column(Integer, ForeignKey("route_stops.stop_id"))
    dropoff_stop_id = Column(Integer, ForeignKey("route_stops.stop_id"))
    
    # Relationships
    student = relationship("Student", back_populates="student_routes")
    route = relationship("Route", back_populates="student_routes")
    pickup_stop = relationship("RouteStop", foreign_keys=[pickup_stop_id], back_populates="pickup_students")
    dropoff_stop = relationship("RouteStop", foreign_keys=[dropoff_stop_id], back_populates="dropoff_students")