from fastapi import Depends, HTTPException, status
from typing import List
from .auth import verify_token  # JWT verification function

def login_required(token_data: dict = Depends(verify_token)) -> dict:
    """
    Dependency to ensure the user is logged in.
    Returns the decoded JWT payload (user_id, role, etc.).
    Raises 401 if token is missing or invalid.
    """
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login required"
        )
    return token_data


def role_required(allowed_roles: List[str]):
    """
    Returns a dependency that ensures the user has one of the allowed roles.
    Usage:
        @router.get("/admin-only", dependencies=[Depends(role_required(["admin"]))])
    """
    def dependency(token_data: dict = Depends(verify_token)) -> dict:
        user_role = token_data.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: role '{user_role}' not permitted"
            )
        return token_data
    return dependency