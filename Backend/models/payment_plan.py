from sqlalchemy import Column, Integer, String, DECIMAL
from sqlalchemy.orm import relationship
from models.user import Base

class PaymentPlan(Base):
    __tablename__ = "payment_plans"
    
    plan_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    fee_amount = Column(DECIMAL(8, 2))
    duration = Column(String(50))
    
    # Relationships
    payments = relationship("Payment", back_populates="plan", cascade="all, delete-orphan")