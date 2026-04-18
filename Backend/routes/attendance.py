from fastapi import APIRouter, Depends, HTTPException, Query
from models.absence import Absence, AbsenceStatus
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date, time, timedelta
from typing import List, Optional
from pydantic import BaseModel

from models.attendance import Attendance, AttendanceStatus
from models.student import Student
from models.student_route import StudentRoute

from auth.dependencies import login_required
from database import get_db

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



class AbsenceRequest(BaseModel):
    student_id: int
    date: date
    reason: str

class AbsenceResponse(BaseModel):
    absence_id: int
    student_id: int
    date: date
    reason: str
    status: str
    reported_at: datetime

    class Config:
        from_attributes = True

#Helper functions for cheking chekout 

def check_if_late(check_in_time: datetime, expected_time: Optional[time]) -> bool:
    
    if not expected_time:
        return False
    check_in_only = check_in_time.time()
    return check_in_only > expected_time


async def get_expected_pickup_time(db: AsyncSession, student_id: int, route_id: int) -> Optional[time]:
    
    result = await db.execute(
        select(StudentRoute).where(
            StudentRoute.student_id == student_id,
            StudentRoute.route_id == route_id
        )
    )
    student_route = result.scalar_one_or_none()

    if student_route and student_route.pickup_stop:
        return student_route.pickup_stop.expected_time
    return None

#CHECK-IN ENDPOINT
@router.post("/checkin", response_model=AttendanceResponse)
async def check_in(
    request: CheckInRequest,
    current_user = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):


    # Verify student exists
    result = await db.execute(
        select(Student).where(Student.student_id == request.student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if student is assigned to this route
    result = await db.execute(
        select(StudentRoute).where(
            StudentRoute.student_id == request.student_id,
            StudentRoute.route_id == request.route_id
        )
    )
    student_route = result.scalar_one_or_none()

    if not student_route:
        raise HTTPException(status_code=400, detail="Student not assigned to this route")

    # Check already checked in today
    today = date.today()
    result = await db.execute(
        select(Attendance).where(
            Attendance.student_id == request.student_id,
            Attendance.route_id == request.route_id,
            Attendance.date == today
        )
    )
    existing = result.scalar_one_or_none()

    if existing and existing.check_in_time:
        raise HTTPException(status_code=400, detail="Student already checked in today")

    # Get expected pickup time 
    expected_time = await get_expected_pickup_time(db, request.student_id, request.route_id)

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

    await db.commit()
    await db.refresh(attendance)
    return attendance





## atendance summary helper function
async def get_attendance_summary(db: AsyncSession, student_id: int, start_date: date, end_date: date) -> AttendanceSummary:
    """Calculate attendance statistics for a student"""
    result = await db.execute(
        select(Attendance).where(
            Attendance.student_id == student_id,
            Attendance.date >= start_date,
            Attendance.date <= end_date
        )
    )
    records = result.scalars().all()

    total_days = len(records)
    present_days = len([r for r in records if r.status == AttendanceStatus.PRESENT])
    absent_days = len([r for r in records if r.status == AttendanceStatus.ABSENT])
    no_show_days = len([r for r in records if r.status == AttendanceStatus.NO_SHOW])
    late_days = len([r for r in records if r.is_late])

    attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0

    return AttendanceSummary(
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        no_show_days=no_show_days,
        late_days=late_days,
        attendance_percentage=round(attendance_percentage, 2)
    )


#CHECK-OUT ENDPOINT
@router.post("/checkout", response_model=AttendanceResponse)
async def check_out(
    request: CheckOutRequest,
    current_user = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    

    today = date.today()

    # Find attendance record
    result = await db.execute(
        select(Attendance).where(
            Attendance.student_id == request.student_id,
            Attendance.bus_id == request.bus_id,
            Attendance.date == today,
            Attendance.check_in_time != None  # Must have checked in
        )
    )
    attendance = result.scalar_one_or_none()

    if not attendance:
        raise HTTPException(status_code=404, detail="No check-in record found for today")

    if attendance.check_out_time:
        raise HTTPException(status_code=400, detail="Student already checked out")

    # Record time
    attendance.check_out_time = datetime.now()
    await db.commit()
    await db.refresh(attendance)

    return attendance

##attendance history endpoint 
@router.get("/history/{student_id}", response_model=List[AttendanceHistoryResponse])
async def get_attendance_history(
    student_id: int,
    days: int = Query(30, ge=1, le=365),
    current_user = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
   
    # Verify student exists
    result = await db.execute(
        select(Student).where(Student.student_id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Calculate date range
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Get attendance records
    result = await db.execute(
        select(Attendance).where(
            Attendance.student_id == student_id,
            Attendance.date >= start_date,
            Attendance.date <= end_date
        ).order_by(Attendance.date.desc())
    )
    records = result.scalars().all()

    return records


#attendance summary endpoint
@router.get("/summary/{student_id}", response_model=AttendanceSummary)
async def get_attendance_summary_endpoint(
    student_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    summary = await get_attendance_summary(db, student_id, start_date, end_date)
    return summary


#auto mark missed pickups endpoint
@router.post("/mark-missed-pickups/{route_id}")
async def mark_missed_pickups(
    route_id: int,
    current_user = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    """
    Auto-mark students as NO_SHOW if they didn't board
    - Called at end of route for that day
    - Creates attendance records for missed students
    """
    # Get route details
    from models.route import Route
    result = await db.execute(
        select(Route).where(Route.route_id == route_id)
    )
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Get all students on this route
    result = await db.execute(
        select(StudentRoute).where(StudentRoute.route_id == route_id)
    )
    student_routes = result.scalars().all()
    
    today = date.today()
    marked_count = 0
    
    for sr in student_routes:
        # Check if attendance record exists
        result = await db.execute(
            select(Attendance).where(
                Attendance.student_id == sr.student_id,
                Attendance.route_id == route_id,
                Attendance.date == today
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            # Mark as NO_SHOW
            no_show = Attendance(
                student_id=sr.student_id,
                bus_id=route.bus_id,
                route_id=route_id,
                date=today,
                status=AttendanceStatus.NO_SHOW,
                is_no_show=True
            )
            db.add(no_show)
            marked_count += 1
    
    await db.commit()
    return {
        "message": f"Marked {marked_count} students as NO_SHOW on route {route_id}",
        "marked_count": marked_count
    }


#Absence reporting endpoint
@router.post("/absence", response_model=AbsenceResponse)
async def report_absence(
    request: AbsenceRequest,
    current_user = Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    """
    Report absence for a student
    - Parents can report for their children
    - Sets status to PENDING (awaiting admin approval)
    - Reason is required
    """
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check for duplicate report
    existing = db.query(Absence).filter(
        Absence.student_id == request.student_id,
        Absence.date == request.date
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Absence already reported for this date")

    # Create absence record
    absence = Absence(
        student_id=request.student_id,
        date=request.date,
        reason=request.reason,
        status=AbsenceStatus.PENDING
    )

    db.add(absence)
    db.commit()
    db.refresh(absence)

    return absence

    
# Get student absences endpoint
@router.get("/absences/{student_id}")
async def get_student_absences(
    student_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get all absences for this student
    absences = db.query(Absence).filter(
        Absence.student_id == student_id
    ).order_by(Absence.date.desc()).all()

    return absences

# Get pending absences endpoint
@router.get("/absences/pending")
async def get_pending_absences(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    # Note: Add admin role check here
    absences = db.query(Absence).filter(
        Absence.status == AbsenceStatus.PENDING
    ).order_by(Absence.reported_at.desc()).all()

    return absences

# admin approval endpoint
@router.put("/absences/{absence_id}/approve")
async def approve_absence(
    absence_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    # Find the absence
    absence = db.query(Absence).filter(Absence.absence_id == absence_id).first()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")

    # Check if already processed
    if absence.status != AbsenceStatus.PENDING:
        raise HTTPException(
            status_code=400, 
            detail=f"Absence already {absence.status}. Only pending absences can be approved."
        )

    # Approve the absence
    absence.status = AbsenceStatus.APPROVED
    absence.approved_by = current_user.user_id
    absence.approval_date = datetime.now()
    absence.is_excused = True

    db.commit()
    db.refresh(absence)

    return {
        "message": "Absence approved successfully",
        "absence": absence
    }

# admin rejection endpoint
@router.put("/absences/{absence_id}/reject")
async def reject_absence(
    absence_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # Find the absence
    absence = db.query(Absence).filter(Absence.absence_id == absence_id).first()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")

    # Check if already processed
    if absence.status != AbsenceStatus.PENDING:
        raise HTTPException(
            status_code=400, 
            detail=f"Absence already {absence.status}. Only pending absences can be rejected."
        )

    # Reject the absence
    absence.status = AbsenceStatus.REJECTED
    absence.approved_by = current_user.user_id
    absence.approval_date = datetime.now()
    # is_excused remains False

    db.commit()
    db.refresh(absence)

    return {
        "message": "Absence rejected successfully",
        "absence": absence
    }