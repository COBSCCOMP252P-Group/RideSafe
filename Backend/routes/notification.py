from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from models.notification import Notification
from models.user import User
from auth.dependencies import login_required
from database import get_db

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


# ─── Schemas ───────────────────────────────────────────────

class NotificationResponse(BaseModel):
    notification_id: int
    user_id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AnnouncementRequest(BaseModel):
    message: str
    type: str = "announcement"  # boarding, delay, sos, announcement


# ─── Helper (called by other modules) ──────────────────────

async def create_notification(
    db: AsyncSession,
    user_id: int,
    message: str,
    type: str
):
    """
    Shared utility — import this in attendance.py, incident.py, etc.
    Example:
        from routes.notification import create_notification
        await create_notification(db, user_id=5, message="Your bus is delayed", type="delay")
    """
    notification = Notification(
        user_id=user_id,
        message=message,
        type=type
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


# ─── GET /notifications ─────────────────────────────────────

@router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    current_user=Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all notifications for the logged-in user."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.user_id)
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()


# ─── PUT /notifications/{id}/read ───────────────────────────

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: int,
    current_user=Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    """Mark a single notification as read."""
    result = await db.execute(
        select(Notification).where(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id  # user can only mark their own
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.is_read:
        raise HTTPException(status_code=400, detail="Notification already marked as read")

    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification


# ─── POST /announcement ─────────────────────────────────────

@router.post("/announcement")
async def send_announcement(
    request: AnnouncementRequest,
    current_user=Depends(login_required),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin posts an announcement — creates a notification for ALL users.
    Add role check here once your auth supports it.
    """
    # TODO: Uncomment when role check is ready
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Admins only")

    result = await db.execute(select(User))
    all_users = result.scalars().all()

    notifications = [
        Notification(
            user_id=user.user_id,
            message=request.message,
            type=request.type
        )
        for user in all_users
    ]

    db.add_all(notifications)
    await db.commit()

    return {
        "message": f"Announcement sent to {len(notifications)} users",
        "count": len(notifications)
    }