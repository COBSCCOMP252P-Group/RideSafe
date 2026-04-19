from fastapi import APIRouter, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from database import async_session
from models.student import Student

router = APIRouter(
    prefix="/students",
    tags=["students"]
)

# ==========================
# Schemas
# ==========================

class StudentCreate(BaseModel):
    full_name: str
    grade: Optional[str] = None
    index_no: Optional[str] = None
    parent_id: Optional[int] = None
    status: Optional[str] = "active"


class StudentResponse(StudentCreate):
    student_id: int


# ==========================
# CREATE STUDENT
# ==========================

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate):
    async with async_session() as session:

        new_student = Student(
            full_name=student.full_name,
            grade=student.grade,
            index_no=student.index_no,
            parent_id=student.parent_id,
            status=student.status
        )

        session.add(new_student)
        await session.commit()
        await session.refresh(new_student)

        return new_student


# ==========================
# GET ALL STUDENTS
# ==========================

@router.get("/", response_model=List[StudentResponse])
async def get_students():
    async with async_session() as session:
        result = await session.execute(select(Student))
        return result.scalars().all()


# ==========================
# GET STUDENT BY ID
# ==========================

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(Student).where(Student.student_id == student_id)
        )
        student = result.scalar_one_or_none()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return student


# ==========================
# UPDATE STUDENT
# ==========================

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: int, updated: StudentCreate):
    async with async_session() as session:
        result = await session.execute(
            select(Student).where(Student.student_id == student_id)
        )
        student = result.scalar_one_or_none()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        for key, value in updated.dict().items():
            setattr(student, key, value)

        await session.commit()
        await session.refresh(student)

        return student


# ==========================
# DELETE STUDENT
# ==========================

@router.delete("/{student_id}")
async def delete_student(student_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(Student).where(Student.student_id == student_id)
        )
        student = result.scalar_one_or_none()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        await session.delete(student)
        await session.commit()

        return {"message": "Student deleted successfully"}