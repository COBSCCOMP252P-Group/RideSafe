from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.base import Base


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)

    parent_id = Column(Integer, ForeignKey("parents.parent_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))

    rating = Column(Integer)
    comments = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())