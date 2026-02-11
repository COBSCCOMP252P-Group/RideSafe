from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.user import Base

class Driver(Base):
    __tablename__ = "drivers"
    
    driver_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, index=True)
    license_number = Column(String(50))
    emergency_contact = Column(String(20))
    
    # Relationships
    user = relationship("User", back_populates="driver")
    assigned_route = relationship("Route", back_populates="driver", uselist=False, cascade="all, delete-orphan")
    reported_incidents = relationship("Incident", back_populates="driver", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", back_populates="driver", cascade="all, delete-orphan")
    feedbacks_received = relationship("Feedback", back_populates="driver", cascade="all, delete-orphan")