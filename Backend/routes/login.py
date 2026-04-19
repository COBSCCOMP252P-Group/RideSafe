from fastapi import APIRouter, HTTPException, status
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional

from database import async_session
from models import User
from auth import create_access_token

router = APIRouter(
    prefix="/login",
    tags=["auth"]
)

# --------------------------
# Schemas
# --------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    redirect_url: Optional[str] = None


# --------------------------
# Login Endpoint
# --------------------------

@router.post("/", response_model=TokenResponse)
async def login_user(login_data: LoginRequest):

    async with async_session() as session:

        # Find user
        result = await session.execute(
            select(User).where(User.username == login_data.username)
        )

        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

        # Verify password
        if not login_data.password == user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

        # Check account status
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive or suspended"
            )

        role = user.role

        # --------------------------
        # Create JWT Token
        # --------------------------
        access_token = create_access_token(
            data={
                "user_id": user.user_id,
                "role": role
            }
        )

        # --------------------------
        # Role Based Redirect
        # --------------------------
        redirect_url = None

        if role == "admin":
            redirect_url = "http://localhost:3000/admin/dashboard"

        elif role == "parent":
            redirect_url = "http://localhost:3000/parent/dashboard"

        elif role == "driver":
            redirect_url = "http://localhost:3000/driver/dashboard"

        # --------------------------
        # Response
        # --------------------------
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.user_id,
                "username": user.username,
                "role": role
            },
            "redirect_url": redirect_url
        }