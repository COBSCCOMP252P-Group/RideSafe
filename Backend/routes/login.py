from fastapi import APIRouter, HTTPException, status
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional

from database import async_session
from models import User
from auth import verify_password, create_access_token

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


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None
    redirect_url: Optional[str] = None


# --------------------------
# Login Endpoint
# --------------------------

@router.post("/", response_model=TokenResponse)
async def login_user(login_data: LoginRequest):

    async with async_session() as session:
        async with session.begin():

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
            if not verify_password(login_data.password, user.password_hash):
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

            # Create JWT token
            access_token = create_access_token(
                data={"user_id": user.user_id, "role": role}
            )

            # Role based redirect
            redirect_url = None

            if role == "ADMIN":
                redirect_url = "http://localhost:3000/admin/dashboard"

            elif role == "PARENT":
                redirect_url = "http://localhost:3000/parent/dashboard"

            elif role == "DRIVER":
                redirect_url = "http://localhost:3000/driver/dashboard"

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "role": role,
                "redirect_url": redirect_url
            }