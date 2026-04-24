import qrcode
import base64
from io import BytesIO
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.qr_code import QRCode
from models.student import Student

def generate_qr_token(student_id: int) -> str:
    """Generate simple QR token (just student ID as string)"""
    # Option 1: Just use student ID as string (simplest)
    return str(student_id)
    
    # Option 2: Add a random element for security (uncomment if needed)
    # random_part = secrets.token_hex(4)
    # return f"{student_id}_{random_part}"

def create_qr_code_image(token: str) -> str:
    """Create QR code image and return as base64 string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(token)  # Simply add the token (student ID)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str

async def get_student_from_qr_token(token: str, db: AsyncSession) -> Student:
    """Get student from QR token (which is just student ID)"""
    try:
        # Token is just the student ID
        student_id = int(token)
        
        # Verify student exists
        result = await db.execute(
            select(Student).where(Student.student_id == student_id)
        )
        student = result.scalar_one_or_none()
        
        if not student:
            raise ValueError(f"Student with ID {student_id} not found")
        
        # Optional: Verify QR code is active in database
        result = await db.execute(
            select(QRCode).where(
                QRCode.student_id == student_id,
                QRCode.is_active == True
            )
        )
        qr_record = result.scalar_one_or_none()
        
        if not qr_record:
            raise ValueError(f"No active QR code found for student {student_id}")
        
        return student
        
    except ValueError:
        raise ValueError("Invalid QR code format")