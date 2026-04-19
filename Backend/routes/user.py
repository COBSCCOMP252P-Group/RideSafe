from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from database import async_session
from models import User
from auth.dependencies import role_required

router = APIRouter(
    prefix="/user",
    tags=["User"]
)

# ==========================
# Schemas
# ==========================

class UserCreate(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    role: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class UserResponse(BaseModel):
    user_id: int
    username: str
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    role: str
    status: Optional[str]

    class Config:
        from_attributes = True


# ==========================
# Create User
# ==========================

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, token: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == user.username))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                details="Username already exists"
            )
        
        new_user = User(
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            password_hash=user.password,
            role=user.role,
            status="active"
        )
        
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        return new_user


# ==========================
# Get All Users
# ==========================

@router.get("/", response_model=List[UserResponse])
async def get_users(token: dict = Depends(role_required(["admin"]))):

    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()

    return users


# ==========================
# Get User By ID
# ==========================

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, token: dict = Depends(role_required(["admin"]))):

    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return user


# ==========================
# Update User
# ==========================

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    token: dict = Depends(role_required(["admin"]))
):

    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    await session.commit()
    await session.refresh(user)

    return user


# ==========================
# Delete User
# ==========================

@router.delete("/{user_id}")
async def delete_user(user_id: int, token: dict = Depends(role_required(["admin"]))):

    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )

        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await session.delete(user)
        await session.commit()

        return {"message": "User deleted successfully"}