from fastapi import FastAPI
from routes import routers
from fastapi.middleware.cors import CORSMiddleware
from auth.auth import create_access_token
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import  select
from database import engine, Base, async_session
from models import User
from sqlalchemy import text


# Create FastAPI app

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    
    # Allow the react dev server on 3000 
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # allow all headers
)

@app.on_event("startup")
async def startup_event():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("Database connection successful.")
    except Exception as e:
        print(f"Database connection failed: {e}")

# Include all routers
for router in routers:
    app.include_router(router)
    