from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from database import async_session
from models.payment import Payment
from models.payment_plan import PaymentPlan
from models.parent import Parent
from models.user import User
from auth.dependencies import role_required

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# ==========================
# Schemas
# ==========================

class PaymentCreate(BaseModel):
    plan_id: int
    amount: float
    payment_method: str

class PaymentResponse(BaseModel):
    payment_id: int
    parent_id: int
    plan_id: int
    amount: float
    payment_method: str
    payment_date: date

    class Config:
        from_attributes = True

class PaymentDetailResponse(BaseModel):
    payment_id: int
    parent_id: int
    plan_id: int
    amount: float
    payment_method: str
    payment_date: date
    parent_name: Optional[str] = None
    plan_name: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentPlanCreate(BaseModel):
    name: str
    fee_amount: float
    duration: str

class PaymentPlanUpdate(BaseModel):
    name: Optional[str] = None
    fee_amount: Optional[float] = None
    duration: Optional[str] = None

class PaymentPlanResponse(BaseModel):
    plan_id: int
    name: str
    fee_amount: float
    duration: str

    class Config:
        from_attributes = True

# ==========================
# GET PAYMENT PLANS
# ==========================

@router.get("/plans", response_model=List[PaymentPlanResponse])
async def get_payment_plans():
    async with async_session() as session:
        result = await session.execute(select(PaymentPlan))
        plans = result.scalars().all()
        return plans

# ==========================
# GET ALL PAYMENTS (ADMIN)
# ==========================

@router.get("/all", response_model=List[PaymentDetailResponse], dependencies=[Depends(role_required(["admin"]))])
async def get_all_payments(token_data: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:
        result = await session.execute(select(Payment))
        payments = result.scalars().all()
        
        # Enrich with parent and plan names
        enriched_payments = []
        for payment in payments:
            parent_result = await session.execute(
                select(Parent).where(Parent.parent_id == payment.parent_id)
            )
            parent = parent_result.scalar_one_or_none()
            
            plan_result = await session.execute(
                select(PaymentPlan).where(PaymentPlan.plan_id == payment.plan_id)
            )
            plan = plan_result.scalar_one_or_none()
            
            parent_name = None
            if parent:
                user_result = await session.execute(
                    select(User).where(User.user_id == parent.user_id)
                )
                user = user_result.scalar_one_or_none()
                parent_name = user.full_name if user else None
            
            enriched_payments.append({
                "payment_id": payment.payment_id,
                "parent_id": payment.parent_id,
                "plan_id": payment.plan_id,
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "payment_date": payment.payment_date,
                "parent_name": parent_name,
                "plan_name": plan.name if plan else None
            })
        
        return enriched_payments

# ==========================
# CREATE PAYMENT PLAN (ADMIN)
# ==========================

@router.post("/plans", response_model=PaymentPlanResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(role_required(["admin"]))])
async def create_payment_plan(plan: PaymentPlanCreate, token_data: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:
        new_plan = PaymentPlan(
            name=plan.name,
            fee_amount=plan.fee_amount,
            duration=plan.duration
        )
        session.add(new_plan)
        await session.commit()
        await session.refresh(new_plan)
        return new_plan

# ==========================
# UPDATE PAYMENT PLAN (ADMIN)
# ==========================

@router.put("/plans/{plan_id}", response_model=PaymentPlanResponse, dependencies=[Depends(role_required(["admin"]))])
async def update_payment_plan(plan_id: int, plan_update: PaymentPlanUpdate, token_data: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:
        result = await session.execute(
            select(PaymentPlan).where(PaymentPlan.plan_id == plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=404,
                detail="Payment plan not found"
            )
        
        if plan_update.name:
            plan.name = plan_update.name
        if plan_update.fee_amount:
            plan.fee_amount = plan_update.fee_amount
        if plan_update.duration:
            plan.duration = plan_update.duration
        
        await session.commit()
        await session.refresh(plan)
        return plan

# ==========================
# DELETE PAYMENT PLAN (ADMIN)
# ==========================

@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(role_required(["admin"]))])
async def delete_payment_plan(plan_id: int, token_data: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:
        result = await session.execute(
            select(PaymentPlan).where(PaymentPlan.plan_id == plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=404,
                detail="Payment plan not found"
            )
        
        await session.delete(plan)
        await session.commit()

# ==========================
# CREATE PAYMENT
# ==========================

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(role_required(["parent"]))])
async def create_payment(payment: PaymentCreate, token_data: dict = Depends(role_required(["parent"]))):
    async with async_session() as session:
        user_id = token_data.get("user_id")

        # Get parent_id
        result = await session.execute(
            select(Parent).where(Parent.user_id == user_id)
        )
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(
                status_code=404,
                detail="Parent not found"
            )

        # Create payment
        new_payment = Payment(
            parent_id=parent.parent_id,
            plan_id=payment.plan_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            payment_date=date.today()
        )

        session.add(new_payment)
        await session.commit()
        await session.refresh(new_payment)

        return new_payment