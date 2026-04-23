from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from database import async_session
from models.student import Student, StudentStatus
from models.parent import Parent
from auth.dependencies import role_required

router = APIRouter(prefix="/students", tags=["students"])

class StudentCreate(BaseModel):
    full_name: str
    grade: Optional[str] = None
    parent_id: int
    status: StudentStatus = StudentStatus.ACTIVE
    index_no: Optional[str] = None

class StudentOut(BaseModel):
    student_id: int
    full_name: str
    grade: Optional[str] = None
    parent_id: int
    status: StudentStatus
    index_no: Optional[str] = None

    class Config:
        orm_mode = True

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
