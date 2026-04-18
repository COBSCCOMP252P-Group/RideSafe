from .login import router as login_router
from .attendance import router as attendance_router

routers = [
    login_router,
    attendance_router
]