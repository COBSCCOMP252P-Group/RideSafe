from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, and_
from pydantic import BaseModel
from typing import Optional, List
from datetime import date as pydate, datetime

from database import async_session
from models import User, Parent, Student, Location, StudentFixedLocation, StudentTempLocation
from auth.dependencies import role_required

router = APIRouter(
    prefix="/student-location",
    tags=["Student Location"]
)

# ==========================
# Schemas
# ==========================

class PickupPointBase(BaseModel):
    longitude: float
    latitude: float
    type: str  # "pickup" or "dropoff"

class PermanentPickupPointCreate(PickupPointBase):
    student_id: int

class PermanentPickupPointUpdate(BaseModel):
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    type: Optional[str] = None

class TemporaryPickupPointCreate(PickupPointBase):
    student_id: int
    date: pydate

class TemporaryPickupPointUpdate(BaseModel):
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    type: Optional[str] = None
    date: Optional[pydate] = None

class PickupPointResponse(BaseModel):
    id: int
    student_id: int
    location_id: Optional[int] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    type: Optional[str] = None
    date: Optional[pydate] = None

    class Config:
        from_attributes = True

class StudentPickupPointsResponse(BaseModel):
    student_id: int
    student_name: str
    permanent_pickup_points: List[PickupPointResponse]
    temporary_pickup_points: List[PickupPointResponse]

class PermanentLocationsResponse(BaseModel):
    student_id: int
    student_name: str
    pickup: Optional[PickupPointResponse] = None
    dropoff: Optional[PickupPointResponse] = None

# ==========================
# Helper Functions
# ==========================

async def get_parent_from_token(token: dict, session: AsyncSession):
    """Get parent record from the token"""
    user_id = token.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    result = await session.execute(
        select(Parent).where(Parent.user_id == user_id)
    )
    parent = result.scalar_one_or_none()
    
    if not parent:
        raise HTTPException(status_code=404, detail="Parent record not found")
    
    return parent

async def create_location(longitude: float, latitude: float, session: AsyncSession):
    """Create a new location record and return location_id"""
    new_location = Location(
        longitude=longitude,
        latitude=latitude
    )
    session.add(new_location)
    await session.flush()
    return new_location.location_id

async def verify_student_ownership(parent: Parent, student_id: int, session: AsyncSession):
    """Verify that a student belongs to the parent"""
    result = await session.execute(
        select(Student).where(
            Student.student_id == student_id,
            Student.parent_id == parent.parent_id
        )
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(status_code=403, detail="You don't have access to this student")
    
    return student

# ==========================
# Create Permanent Pickup Point
# ==========================

@router.post("/permanent", response_model=PickupPointResponse, status_code=status.HTTP_201_CREATED)
async def create_permanent_pickup_point(
    pickup_data: PermanentPickupPointCreate,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, pickup_data.student_id, session)
        
        # Check if a permanent location of this type already exists
        existing_result = await session.execute(
            select(StudentFixedLocation).where(
                and_(
                    StudentFixedLocation.student_id == pickup_data.student_id,
                    StudentFixedLocation.type == pickup_data.type
                )
            )
        )
        existing = existing_result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"A permanent {pickup_data.type} location already exists for this student. Please update it instead."
            )
        
        # Create location
        location_id = await create_location(pickup_data.longitude, pickup_data.latitude, session)
        
        # Create permanent pickup point
        new_pickup = StudentFixedLocation(
            student_id=pickup_data.student_id,
            location_id=location_id,
            type=pickup_data.type
        )
        
        session.add(new_pickup)
        await session.commit()
        await session.refresh(new_pickup)
        
        # Get location details for response
        result = await session.execute(
            select(Location).where(Location.location_id == location_id)
        )
        location = result.scalar_one()
        
        return PickupPointResponse(
            id=new_pickup.id,
            student_id=new_pickup.student_id,
            location_id=new_pickup.location_id,
            longitude=location.longitude,
            latitude=location.latitude,
            type=new_pickup.type
        )

# ==========================
# Create Temporary Pickup Point
# ==========================

@router.post("/temporary", response_model=PickupPointResponse, status_code=status.HTTP_201_CREATED)
async def create_temporary_pickup_point(
    pickup_data: TemporaryPickupPointCreate,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, pickup_data.student_id, session)
        
        # Check if a temporary location already exists for this student, date, and type
        existing_result = await session.execute(
            select(StudentTempLocation).where(
                and_(
                    StudentTempLocation.student_id == pickup_data.student_id,
                    StudentTempLocation.date == pickup_data.date,
                    StudentTempLocation.type == pickup_data.type
                )
            )
        )
        existing = existing_result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"A temporary {pickup_data.type} location already exists for this student on {pickup_data.date}. Please update it instead."
            )
        
        # Create location
        location_id = await create_location(pickup_data.longitude, pickup_data.latitude, session)
        
        # Create temporary pickup point
        new_pickup = StudentTempLocation(
            student_id=pickup_data.student_id,
            location_id=location_id,
            type=pickup_data.type,
            date=pickup_data.date
        )
        
        session.add(new_pickup)
        await session.commit()
        await session.refresh(new_pickup)
        
        # Get location details for response
        result = await session.execute(
            select(Location).where(Location.location_id == location_id)
        )
        location = result.scalar_one()
        
        return PickupPointResponse(
            id=new_pickup.id,
            student_id=new_pickup.student_id,
            location_id=new_pickup.location_id,
            longitude=location.longitude,
            latitude=location.latitude,
            type=new_pickup.type,
            date=new_pickup.date
        )

# ==========================
# Get All Pickup Points for Parent's Students
# ==========================

@router.get("/my-students", response_model=List[StudentPickupPointsResponse])
async def get_all_students_pickup_points(
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)

        # Get all students for this parent
        result = await session.execute(
            select(Student).where(Student.parent_id == parent.parent_id)
        )
        students = result.scalars().all()

        response_data = []
        
        for student in students:
            # Get permanent pickup points - SELECT only the columns that exist
            permanent_result = await session.execute(
                select(StudentFixedLocation, Location)
                .join(Location, StudentFixedLocation.location_id == Location.location_id)
                .where(StudentFixedLocation.student_id == student.student_id)
            )
            permanent_pickups = []
            for pickup, location in permanent_result:
                permanent_pickups.append(PickupPointResponse(
                    id=pickup.id,
                    student_id=pickup.student_id,
                    location_id=pickup.location_id,
                    longitude=location.longitude,
                    latitude=location.latitude,
                    type=pickup.type
                ))
            
            # Get temporary pickup points (only future dates)
            temp_result = await session.execute(
                select(StudentTempLocation, Location)
                .join(Location, StudentTempLocation.location_id == Location.location_id)
                .where(
                    and_(
                        StudentTempLocation.student_id == student.student_id,
                        StudentTempLocation.date >= date.today()
                    )
                )
                .order_by(StudentTempLocation.date)
            )
            
            temp_pickup_responses = []
            for pickup, location in temp_result:
                temp_pickup_responses.append(PickupPointResponse(
                    id=pickup.id,
                    student_id=pickup.student_id,
                    location_id=pickup.location_id,
                    longitude=location.longitude,
                    latitude=location.latitude,
                    type=pickup.type,
                    date=pickup.date
                ))
            
            response_data.append(StudentPickupPointsResponse(
                student_id=student.student_id,
                student_name=student.full_name,
                permanent_pickup_points=permanent_pickups,
                temporary_pickup_points=temp_pickup_responses
            ))
        
        return response_data

# ==========================
# Get Permanent Pickup Points for Specific Student
# ==========================

@router.get("/students/{student_id}/permanent", response_model=PermanentLocationsResponse)
async def get_permanent_locations_by_student(
    student_id: int,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Verify student belongs to this parent
        student = await verify_student_ownership(parent, student_id, session)
        
        # Get permanent pickup points for this student
        result = await session.execute(
            select(StudentFixedLocation, Location)
            .join(Location, StudentFixedLocation.location_id == Location.location_id)
            .where(StudentFixedLocation.student_id == student_id)
        )
        
        pickup_location = None
        dropoff_location = None
        
        for pickup, location in result:
            location_data = PickupPointResponse(
                id=pickup.id,
                student_id=pickup.student_id,
                location_id=pickup.location_id,
                longitude=location.longitude,
                latitude=location.latitude,
                type=pickup.type
            )
            
            if pickup.type == "pickup":
                pickup_location = location_data
            elif pickup.type == "dropoff":
                dropoff_location = location_data
        
        return PermanentLocationsResponse(
            student_id=student.student_id,
            student_name=student.full_name,
            pickup=pickup_location,
            dropoff=dropoff_location
        )

# ==========================
# Get Pickup Points for Specific Student (All types)
# ==========================

@router.get("/students/{student_id}", response_model=StudentPickupPointsResponse)
async def get_student_pickup_points(
    student_id: int,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Verify student belongs to this parent
        student = await verify_student_ownership(parent, student_id, session)
        
        # Get permanent pickup points
        permanent_result = await session.execute(
            select(StudentFixedLocation, Location)
            .join(Location, StudentFixedLocation.location_id == Location.location_id)
            .where(StudentFixedLocation.student_id == student_id)
        )
        permanent_pickups = []
        for pickup, location in permanent_result:
            permanent_pickups.append(PickupPointResponse(
                id=pickup.id,
                student_id=pickup.student_id,
                location_id=pickup.location_id,
                longitude=location.longitude,
                latitude=location.latitude,
                type=pickup.type
            ))
        
        # Get temporary pickup points (only future dates)
        temp_result = await session.execute(
            select(StudentTempLocation, Location)
            .join(Location, StudentTempLocation.location_id == Location.location_id)
            .where(
                and_(
                    StudentTempLocation.student_id == student_id,
                    StudentTempLocation.date >= pydate.today()
                )
            )
            .order_by(StudentTempLocation.date)
        )
        
        temp_pickup_responses = []
        for pickup, location in temp_result:
            temp_pickup_responses.append(PickupPointResponse(
                id=pickup.id,
                student_id=pickup.student_id,
                location_id=pickup.location_id,
                longitude=location.longitude,
                latitude=location.latitude,
                type=pickup.type,
                date=pickup.date
            ))
        
        return StudentPickupPointsResponse(
            student_id=student.student_id,
            student_name=student.full_name,
            permanent_pickup_points=permanent_pickups,
            temporary_pickup_points=temp_pickup_responses
        )

# ==========================
# Get Temporary Pickup Point by Date
# ==========================

@router.get("/students/{student_id}/temporary/by-date")
async def get_temporary_location_by_date(
    student_id: int,
    date_param: pydate = Query(..., description="Date to check for temporary location"),
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)

        # Verify student belongs to this parent
        await verify_student_ownership(parent, student_id, session)
        
        # Get both pickup and dropoff locations for the specific date
        result = await session.execute(
            select(StudentTempLocation, Location)
            .join(Location, StudentTempLocation.location_id == Location.location_id)
            .where(
                and_(
                    StudentTempLocation.student_id == student_id,
                    StudentTempLocation.date == date_param
                )
            )
        )
        
        locations = []
        for temp_loc, location in result:
            locations.append({
                "id": temp_loc.id,
                "student_id": temp_loc.student_id,
                "location_id": temp_loc.location_id,
                "longitude": location.longitude,
                "latitude": location.latitude,
                "type": temp_loc.type,
                "date": temp_loc.date
            })
        
        return {
            "student_id": student_id,
            "date": date_param,
            "locations": locations
        }

# ==========================
# Get Specific Temporary Pickup Point by Type and Date
# ==========================

@router.get("/students/{student_id}/temporary/specific")
async def get_specific_temporary_location(
    student_id: int,
    type: str = Query(..., description="pickup or dropoff"),
    date_param: pydate = Query(..., description="Date for the temporary location"),
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, student_id, session)
        
        # Get specific temporary location
        result = await session.execute(
            select(StudentTempLocation, Location)
            .join(Location, StudentTempLocation.location_id == Location.location_id)
            .where(
                and_(
                    StudentTempLocation.student_id == student_id,
                    StudentTempLocation.type == type,
                    StudentTempLocation.date == date_param
                )
            )
        )
        
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"No {type} location found for date {date_param}")
        
        temp_loc, location = row
        
        return {
            "id": temp_loc.id,
            "student_id": temp_loc.student_id,
            "location_id": temp_loc.location_id,
            "longitude": location.longitude,
            "latitude": location.latitude,
            "type": temp_loc.type,
            "date": temp_loc.date
        }

# ==========================
# Update Permanent Pickup Point
# ==========================

@router.put("/permanent/{pickup_id}", response_model=PickupPointResponse)
async def update_permanent_pickup_point(
    pickup_id: int,
    pickup_data: PermanentPickupPointUpdate,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Get the pickup point
        result = await session.execute(
            select(StudentFixedLocation).where(StudentFixedLocation.id == pickup_id)
        )
        pickup = result.scalar_one_or_none()
        
        if not pickup:
            raise HTTPException(status_code=404, detail="Permanent pickup point not found")
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, pickup.student_id, session)
        
        # Update location if coordinates provided
        if pickup_data.longitude is not None and pickup_data.latitude is not None:
            location_result = await session.execute(
                select(Location).where(Location.location_id == pickup.location_id)
            )
            location = location_result.scalar_one_or_none()
            
            if location:
                location.longitude = pickup_data.longitude
                location.latitude = pickup_data.latitude
        
        # Update type if provided
        if pickup_data.type is not None:
            pickup.type = pickup_data.type
        
        await session.commit()
        await session.refresh(pickup)
        
        # Get updated location
        loc_result = await session.execute(
            select(Location).where(Location.location_id == pickup.location_id)
        )
        location = loc_result.scalar_one()
        
        return PickupPointResponse(
            id=pickup.id,
            student_id=pickup.student_id,
            location_id=pickup.location_id,
            longitude=location.longitude,
            latitude=location.latitude,
            type=pickup.type
        )

# ==========================
# Update Temporary Pickup Point
# ==========================

@router.put("/temporary/{pickup_id}", response_model=PickupPointResponse)
async def update_temporary_pickup_point(
    pickup_id: int,
    pickup_data: TemporaryPickupPointUpdate,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Get the pickup point
        result = await session.execute(
            select(StudentTempLocation).where(StudentTempLocation.id == pickup_id)
        )
        pickup = result.scalar_one_or_none()
        
        if not pickup:
            raise HTTPException(status_code=404, detail="Temporary pickup point not found")
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, pickup.student_id, session)
        
        # Check if StudentTempLocation has location_id column
        # If your model doesn't have location_id, you need to add it or adjust this logic
        if hasattr(pickup, 'location_id') and pickup.location_id:
            # Update location if coordinates provided
            if pickup_data.longitude is not None and pickup_data.latitude is not None:
                loc_result = await session.execute(
                    select(Location).where(Location.location_id == pickup.location_id)
                )
                location = loc_result.scalar_one_or_none()
                if location:
                    location.longitude = pickup_data.longitude
                    location.latitude = pickup_data.latitude
        else:
            # If no location_id, create a new location and associate it
            if pickup_data.longitude is not None and pickup_data.latitude is not None:
                location_id = await create_location(pickup_data.longitude, pickup_data.latitude, session)
                pickup.location_id = location_id
        
        # Update type if provided
        if pickup_data.type is not None:
            pickup.type = pickup_data.type
        
        # Update date if provided
        if pickup_data.date is not None:
            # Check if a location already exists for the new date
            existing_result = await session.execute(
                select(StudentTempLocation).where(
                    and_(
                        StudentTempLocation.student_id == pickup.student_id,
                        StudentTempLocation.date == pickup_data.date,
                        StudentTempLocation.type == pickup.type,
                        StudentTempLocation.id != pickup_id
                    )
                )
            )
            existing = existing_result.scalar_one_or_none()
            
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"A temporary {pickup.type} location already exists for this student on {pickup_data.date}"
                )
            
            pickup.date = pickup_data.date
        
        await session.commit()
        await session.refresh(pickup)
        
        # Get location details
        if hasattr(pickup, 'location_id') and pickup.location_id:
            loc_result = await session.execute(
                select(Location).where(Location.location_id == pickup.location_id)
            )
            location = loc_result.scalar_one_or_none()
            
            return PickupPointResponse(
                id=pickup.id,
                student_id=pickup.student_id,
                location_id=pickup.location_id,
                longitude=location.longitude if location else None,
                latitude=location.latitude if location else None,
                type=pickup.type,
                date=pickup.date
            )
        else:
            return PickupPointResponse(
                id=pickup.id,
                student_id=pickup.student_id,
                location_id=None,
                longitude=None,
                latitude=None,
                type=pickup.type,
                date=pickup.date
            )

# ==========================
# Delete Permanent Pickup Point
# ==========================

@router.delete("/permanent/{pickup_id}")
async def delete_permanent_pickup_point(
    pickup_id: int,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Get the pickup point
        result = await session.execute(
            select(StudentFixedLocation).where(StudentFixedLocation.id == pickup_id)
        )
        pickup = result.scalar_one_or_none()
        
        if not pickup:
            raise HTTPException(status_code=404, detail="Permanent pickup point not found")
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, pickup.student_id, session)
        
        # Delete location record
        if pickup.location_id:
            await session.execute(
                delete(Location).where(Location.location_id == pickup.location_id)
            )
        
        # Delete pickup point
        await session.delete(pickup)
        await session.commit()
        
        return {"message": "Permanent pickup point deleted successfully"}

# ==========================
# Delete Temporary Pickup Point
# ==========================

@router.delete("/temporary/{pickup_id}")
async def delete_temporary_pickup_point(
    pickup_id: int,
    token: dict = Depends(role_required(["parent"]))
):
    async with async_session() as session:
        # Get parent from token
        parent = await get_parent_from_token(token, session)
        
        # Get the pickup point
        result = await session.execute(
            select(StudentTempLocation).where(StudentTempLocation.id == pickup_id)
        )
        pickup = result.scalar_one_or_none()
        
        if not pickup:
            raise HTTPException(status_code=404, detail="Temporary pickup point not found")
        
        # Verify student belongs to this parent
        await verify_student_ownership(parent, pickup.student_id, session)
        
        # Delete location record if it exists
        if hasattr(pickup, 'location_id') and pickup.location_id:
            await session.execute(
                delete(Location).where(Location.location_id == pickup.location_id)
            )
        
        # Delete pickup point
        await session.delete(pickup)
        await session.commit()
        
        return {"message": "Temporary pickup point deleted successfully"}

# ==========================
# Delete All Expired Temporary Locations
# ==========================

@router.delete("/temporary/cleanup/expired")
async def delete_expired_temporary_locations(
    token: dict = Depends(role_required(["admin", "parent"]))
):
    async with async_session() as session:
        # Get all expired temporary locations (date < today)
        result = await session.execute(
            select(StudentTempLocation).where(StudentTempLocation.date < date.today())
        )
        expired_locations = result.scalars().all()
        
        deleted_count = 0
        for location in expired_locations:
            # Delete associated location record if it exists
            if hasattr(location, 'location_id') and location.location_id:
                await session.execute(
                    delete(Location).where(Location.location_id == location.location_id)
                )
            await session.delete(location)
            deleted_count += 1
        
        await session.commit()
        
        return {"message": f"Deleted {deleted_count} expired temporary locations"}