from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from database import async_session, get_db
from models.student import Student, StudentStatus
from models.parent import Parent
from auth.dependencies import role_required, login_required

router = APIRouter(prefix="/students", tags=["students"])

class StudentCreate(BaseModel):
    full_name: str
    grade: Optional[str] = None
    parent_id: int
    status: StudentStatus = StudentStatus.ACTIVE
    index_no: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    grade: Optional[str] = None
    status: Optional[StudentStatus] = None
    index_no: Optional[str] = None

class StudentOut(BaseModel):
    student_id: int
    full_name: str
    grade: Optional[str] = None
    parent_id: int
    status: StudentStatus
    index_no: Optional[str] = None

    class Config:
        from_attributes = True

# GET all students
@router.get("", response_model=List[StudentOut])
async def get_all_students(
    token_data: dict = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    """Get students for the logged-in user.
    Parents get only their children; admins get all students."""
    user_role = token_data.get("role")
    user_id = token_data.get("user_id")

    if user_role == "parent":
        try:
            parent_user_id = int(user_id)
        except (TypeError, ValueError):
            raise HTTPException(status_code=401, detail="Invalid token user_id")

        result = await db.execute(select(Parent).where(Parent.user_id == parent_user_id))
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent record not found")

        student_result = await db.execute(select(Student).where(Student.parent_id == parent.parent_id))
        students = student_result.scalars().all()
        return students

    # For admins and other authorized users, return full list
    result = await db.execute(select(Student))
    students = result.scalars().all()
    return students

# GET single student
@router.get("/{student_id}", response_model=StudentOut)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific student by ID"""
    result = await db.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate, token: dict = Depends(role_required(["admin"]))):
    async with async_session() as session:
        # Check if parent exists
        parent = await session.get(Parent, student.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        new_student = Student(
            full_name=student.full_name,
            grade=student.grade,
            parent_id=student.parent_id,
            status=student.status,
            index_no=student.index_no
        )  
        session.add(new_student)
        await session.commit()
        await session.refresh(new_student)
        return new_student
