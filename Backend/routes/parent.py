from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from database import async_session
from models.parent import Parent
from models.user import User
from models.student import Student
from auth.dependencies import role_required

router = APIRouter(
    prefix="/parents",
    tags=["parents"]
)

# ==========================
# Schemas
# ==========================

class ParentCreate(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    address: Optional[str] = None


class ParentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None


class ParentResponse(BaseModel):
    parent_id: int
    user_id: int
    address: Optional[str] = None

    class Config:
        from_attributes = True

class StudentOut(BaseModel):
    student_id: int
    full_name: str
    grade: Optional[str] = None
    index_no: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


# ==========================
# CREATE PARENT + USER
# ==========================

@router.post("/", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(parent: ParentCreate, token: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:

        # Check username already exists
        result = await session.execute(
            select(User).where(User.username == parent.username)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        # Create user
        new_user = User(
            username=parent.username,
            full_name=parent.full_name,
            email=parent.email,
            phone=parent.phone,
            password_hash=parent.password,
            role="parent",
            status="active"
        )

        session.add(new_user)

        # Generate user_id before commit
        await session.flush()

        # Create parent
        new_parent = Parent(
            user_id=new_user.user_id,
            address=parent.address
        )

        session.add(new_parent)

        await session.commit()
        await session.refresh(new_parent)

        return new_parent


# ==========================
# GET ALL PARENTS
# ==========================

@router.get("/", response_model=List[ParentResponse])
async def get_parents():
    async with async_session() as session:
        result = await session.execute(select(Parent))
        return result.scalars().all()

# ==========================
# GET ALL STUDENTS FOR A PARENT
# ==========================

@router.get("/students", response_model=List[StudentOut])
async def get_students_for_parent(token: dict = Depends(role_required(["parent"]))):
    async with async_session() as session:
        # Check if parent exists
        result = await session.execute(
            select(Parent).where(Parent.user_id == token["user_id"])
        )
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        # Get students
        result = await session.execute(
            select(Student).where(Student.parent_id == parent.parent_id)
        )
        students = result.scalars().all()
        
        return students

# ==========================
# GET PARENT BY ID
# ==========================

@router.get("/{parent_id}", response_model=ParentResponse)
async def get_parent(parent_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(Parent).where(Parent.parent_id == parent_id)
        )

        parent = result.scalar_one_or_none()

        if not parent:
            raise HTTPException(
                status_code=404,
                detail="Parent not found"
            )

        return parent


# ==========================
# UPDATE PARENT + USER
# ==========================

@router.put("/{parent_id}", response_model=ParentResponse)
async def update_parent(parent_id: int, updated: ParentUpdate):
    async with async_session() as session:

        result = await session.execute(
            select(Parent).where(Parent.parent_id == parent_id)
        )

        parent = result.scalar_one_or_none()

        if not parent:
            raise HTTPException(
                status_code=404,
                detail="Parent not found"
            )

        # Load linked user
        result = await session.execute(
            select(User).where(User.user_id == parent.user_id)
        )

        user = result.scalar_one_or_none()

        if updated.full_name is not None:
            user.full_name = updated.full_name

        if updated.email is not None:
            user.email = updated.email

        if updated.phone is not None:
            user.phone = updated.phone

        if updated.password is not None:
            user.password_hash = updated.password

        if updated.status is not None:
            user.status = updated.status

        if updated.address is not None:
            parent.address = updated.address

        await session.commit()
        await session.refresh(parent)

        return parent


# ==========================
# DELETE PARENT + USER
# ==========================

@router.delete("/{parent_id}")
async def delete_parent(parent_id: int):
    async with async_session() as session:

        result = await session.execute(
            select(Parent).where(Parent.parent_id == parent_id)
        )

        parent = result.scalar_one_or_none()

        if not parent:
            raise HTTPException(
                status_code=404,
                detail="Parent not found"
            )

        # deleting parent will cascade user only if DB designed that way
        await session.delete(parent)
        await session.commit()

        return {"message": "Parent deleted successfully"}