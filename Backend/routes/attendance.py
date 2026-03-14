from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, time
from typing import List, Optional
from pydantic import BaseModel

from models.attendance import Attendance, AttendanceStatus

from models.student import Student
from models.student_route import StudentRoute
from models.route import RouteStop
from auth.dependencies import get_current_user, get_db

router = APIRouter(prefix="/api/v1/attendance", tags=["attendance"])



class CheckInRequest(BaseModel):
    student_id: int
    bus_id: int
    route_id: int
    qr_code: Optional[str] = None  # QR code from student ID card

class CheckOutRequest(BaseModel):
    student_id: int
    bus_id: int
    qr_code: Optional[str] = None

class AttendanceResponse(BaseModel):
    attendance_id: int
    student_id: int
    date: date
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    status: AttendanceStatus
    is_late: bool
    is_no_show: bool

    class Config:
        from_attributes = True

class AttendanceHistoryResponse(BaseModel):
    attendance_id: int
    date: date
    status: AttendanceStatus
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    is_late: bool

    class Config:
        from_attributes = True




class AttendanceSummary(BaseModel):
    total_days: int
    present_days: int
    absent_days: int
    no_show_days: int
    late_days: int
    attendance_percentage: float


#Helper functions for cheking chekout 

def check_if_late(check_in_time: datetime, expected_time: Optional[time]) -> bool:
    
    if not expected_time:
        return False
    check_in_only = check_in_time.time()
    return check_in_only > expected_time


def get_expected_pickup_time(db: Session, student_id: int, route_id: int) -> Optional[time]:
    
    student_route = db.query(StudentRoute).filter(
        StudentRoute.student_id == student_id,
        StudentRoute.route_id == route_id
    ).first()

    if student_route and student_route.pickup_stop:
        return student_route.pickup_stop.expected_time
    return None

#CHECK-IN ENDPOINT
@router.post("/checkin", response_model=AttendanceResponse)
async def check_in(
    request: CheckInRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):


    # Verify student exists
    student = db.query(Student).filter(Student.student_id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if student is assigned to this route
    student_route = db.query(StudentRoute).filter(
        StudentRoute.student_id == request.student_id,
        StudentRoute.route_id == request.route_id
    ).first()

    if not student_route:
        raise HTTPException(status_code=400, detail="Student not assigned to this route")

    # Check already checked in today
    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.student_id == request.student_id,
        Attendance.route_id == request.route_id,
        Attendance.date == today
    ).first()

    if existing and existing.check_in_time:
        raise HTTPException(status_code=400, detail="Student already checked in today")

    # Get expected pickup time 
    expected_time = get_expected_pickup_time(db, request.student_id, request.route_id)

    # update record
    if existing:
        existing.check_in_time = datetime.now()
        existing.status = AttendanceStatus.PRESENT
        existing.is_late = check_if_late(existing.check_in_time, expected_time) if expected_time else False
        attendance = existing
    else:
        attendance = Attendance(
            student_id=request.student_id,
            bus_id=request.bus_id,
            route_id=request.route_id,
            date=today,
            check_in_time=datetime.now(),
            status=AttendanceStatus.PRESENT,
            is_late=check_if_late(datetime.now(), expected_time) if expected_time else False,
            is_no_show=False,
            expected_pickup_time=expected_time
        )
        db.add(attendance)

    db.commit()
    db.refresh(attendance)
    return attendance

#CHECK-OUT ENDPOINT
@router.post("/checkout", response_model=AttendanceResponse)
async def check_out(
    request: CheckOutRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    

    today = date.today()

    # Find attendance record
    attendance = db.query(Attendance).filter(
        Attendance.student_id == request.student_id,
        Attendance.bus_id == request.bus_id,
        Attendance.date == today,
        Attendance.check_in_time != None  # Must have checked in
    ).first()

    if not attendance:
        raise HTTPException(status_code=404, detail="No check-in record found for today")

    if attendance.check_out_time:
        raise HTTPException(status_code=400, detail="Student already checked out")

    # Record time
    attendance.check_out_time = datetime.now()
    db.commit()
    db.refresh(attendance)

    return attendance
