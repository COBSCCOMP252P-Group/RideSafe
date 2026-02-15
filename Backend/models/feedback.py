from sqlalchemy import Column, Integer, Text, DECIMAL, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.user import Base

class Feedback(Base):
    __tablename__ = "feedback"
    
    feedback_id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.parent_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))
    rating = Column(Integer)  # Validation handled at database level with CHECK constraint
    comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    parent = relationship("Parent", back_populates="feedbacks_given")
    driver = relationship("Driver", back_populates="feedbacks_received")