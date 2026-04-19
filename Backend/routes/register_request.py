from fastapi import APIRouter, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from database import async_session
from models import RegisterRequest

router = APIRouter(
    prefix="/register-requests",
    tags=["register_requests"]
)

# ==========================
# Schemas
# ==========================

class RegisterRequestCreate(BaseModel):
    parent_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    student_index: str
    student_name: Optional[str] = None
    student_grade: Optional[str] = None
    request_status: Optional[str] = "pending"


class RegisterRequestResponse(RegisterRequestCreate):
    request_id: int


# ==========================
# CREATE
# ==========================

@router.post("/", response_model=RegisterRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(request: RegisterRequestCreate):
    async with async_session() as session:

        new_request = RegisterRequest(
            parent_name=request.parent_name,
            email=request.email,
            phone_number=request.phone_number,
            address=request.address,
            student_index=request.student_index,
            student_name=request.student_name,
            student_grade=request.student_grade,
            request_status=request.request_status
        )

        session.add(new_request)
        await session.commit()
        await session.refresh(new_request)

        return new_request


# ==========================
# READ ALL
# ==========================

@router.get("/", response_model=List[RegisterRequestResponse])
async def get_all_requests():
    async with async_session() as session:
        result = await session.execute(select(RegisterRequest))
        return result.scalars().all()


# ==========================
# READ BY ID
# ==========================

@router.get("/{request_id}", response_model=RegisterRequestResponse)
async def get_request(request_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(RegisterRequest).where(RegisterRequest.request_id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Request not found"
            )

        return request


# ==========================
# UPDATE
# ==========================

@router.put("/{request_id}", response_model=RegisterRequestResponse)
async def update_request(request_id: int, updated: RegisterRequestCreate):
    async with async_session() as session:
        result = await session.execute(
            select(RegisterRequest).where(RegisterRequest.request_id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Request not found"
            )

        for key, value in updated.dict().items():
            setattr(request, key, value)

        await session.commit()
        await session.refresh(request)

        return request


# ==========================
# DELETE
# ==========================

@router.delete("/{request_id}")
async def delete_request(request_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(RegisterRequest).where(RegisterRequest.request_id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Request not found"
            )

        await session.delete(request)
        await session.commit()

        return {"message": "Request deleted successfully"}