from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from database import async_session
from models import User
from auth.dependencies import role_required

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

# ==========================
# Schemas
# ==========================

class AdminCreate(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

# ==========================
# Create Admin Endpoint
# ==========================

@router.post("/create", response_model=AdminCreate, status_code=status.HTTP_201_CREATED)
async def create_admin(admin: AdminCreate):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == admin.username))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )

        new_admin = User(
            username=admin.username,
            full_name=admin.full_name,
            email=admin.email,
            phone=admin.phone,
            password_hash=admin.password,
            role="admin",
            status="active"
        )

        session.add(new_admin)
        await session.commit()
        await session.refresh(new_admin)

        return admin