from fastapi import APIRouter, HTTPException, status
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from database import async_session
from models.driver import Driver
from models.user import User

router = APIRouter(
    prefix="/drivers",
    tags=["drivers"]
)

# ==========================
# SCHEMAS
# ==========================

class DriverCreate(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    license_number: Optional[str] = None
    emergency_contact: Optional[str] = None


class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    status: Optional[str] = None
    license_number: Optional[str] = None
    emergency_contact: Optional[str] = None


class DriverResponse(BaseModel):
    driver_id: int
    user_id: int
    license_number: Optional[str] = None
    emergency_contact: Optional[str] = None

    class Config:
        from_attributes = True


# ==========================
# CREATE DRIVER + USER
# ==========================

@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(driver: DriverCreate):
    async with async_session() as session:

        # Check username exists
        result = await session.execute(
            select(User).where(User.username == driver.username)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        # Create user
        new_user = User(
            username=driver.username,
            full_name=driver.full_name,
            email=driver.email,
            phone=driver.phone,
            password_hash=driver.password,
            role="driver",
            status="active"
        )

        session.add(new_user)

        # Generate user_id before commit
        await session.flush()

        # Create driver
        new_driver = Driver(
            user_id=new_user.user_id,
            license_number=driver.license_number,
            emergency_contact=driver.emergency_contact
        )

        session.add(new_driver)

        await session.commit()
        await session.refresh(new_driver)

        return new_driver


# ==========================
# GET ALL DRIVERS
# ==========================

@router.get("/", response_model=List[DriverResponse])
async def get_drivers():
    async with async_session() as session:
        result = await session.execute(select(Driver))
        return result.scalars().all()


# ==========================
# GET DRIVER BY ID
# ==========================

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(Driver).where(Driver.driver_id == driver_id)
        )

        driver = result.scalar_one_or_none()

        if not driver:
            raise HTTPException(
                status_code=404,
                detail="Driver not found"
            )

        return driver


# ==========================
# UPDATE DRIVER + USER
# ==========================

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(driver_id: int, updated: DriverUpdate):
    async with async_session() as session:

        result = await session.execute(
            select(Driver).where(Driver.driver_id == driver_id)
        )

        driver = result.scalar_one_or_none()

        if not driver:
            raise HTTPException(
                status_code=404,
                detail="Driver not found"
            )

        # Load linked user
        result = await session.execute(
            select(User).where(User.user_id == driver.user_id)
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

        if updated.license_number is not None:
            driver.license_number = updated.license_number

        if updated.emergency_contact is not None:
            driver.emergency_contact = updated.emergency_contact

        await session.commit()
        await session.refresh(driver)

        return driver


# ==========================
# DELETE DRIVER
# ==========================

@router.delete("/{driver_id}")
async def delete_driver(driver_id: int):
    async with async_session() as session:

        result = await session.execute(
            select(Driver).where(Driver.driver_id == driver_id)
        )

        driver = result.scalar_one_or_none()

        if not driver:
            raise HTTPException(
                status_code=404,
                detail="Driver not found"
            )

        await session.delete(driver)
        await session.commit()

        return {"message": "Driver deleted successfully"}