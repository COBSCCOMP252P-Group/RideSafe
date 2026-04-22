from sqlalchemy import Column, Integer, String, DECIMAL, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from models.base import Base



class Payment(Base):
    __tablename__ = "payments"
    
    payment_id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.parent_id"))
    plan_id = Column(Integer, ForeignKey("payment_plans.plan_id"))
    amount = Column(DECIMAL(8, 2))
    payment_method = Column(String(50))
    payment_date = Column(Date)
    