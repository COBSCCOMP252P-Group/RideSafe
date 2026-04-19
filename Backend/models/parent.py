from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base

class Parent(Base):
    __tablename__ = "parents"

    parent_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)

    address = Column(Text)
    student_id = Column(Integer)