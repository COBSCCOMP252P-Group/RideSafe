from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from models.user import Base

class Parent(Base):
    __tablename__ = "parents"
    
    parent_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, index=True)
    address = Column(Text)
    student_id = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="parent")
    students = relationship("Student", back_populates="parent", cascade="all, delete-orphan")
    feedbacks_given = relationship("Feedback", back_populates="parent", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="parent", cascade="all, delete-orphan")