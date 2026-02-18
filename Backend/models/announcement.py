from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.user import Base

class Announcement(Base):
    __tablename__ = "announcements"
    
    announcement_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150))
    message = Column(Text)
    created_by = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    creator = relationship("User", back_populates="announcements")