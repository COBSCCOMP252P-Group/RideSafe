from .login import router as login_router
from .create_admin import router as create_admin_router
from .user import router as user_router
from .register_request import router as register_request_router
from .student import router as student_router
from .parent import router as parent_router
from .driver import router as driver_router
from .attendance import router as attendance_router
from .payment import router as payment_router
from .incident import router as incident_router


routers = [
    login_router,
    create_admin_router,
    user_router,
    register_request_router,
    student_router,
    parent_router,
    driver_router,
    attendance_router,
    payment_router,
    incident_router,
    attendance_router
]