# database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import AsyncGenerator

DATABASE_URL = (
    "postgresql+asyncpg://dev_user:dev%40%23123%26%25456"
    "@ep-flat-moon-a1uzvxax-pooler.ap-southeast-1.aws.neon.tech/ridesafe_db"
    "?ssl=require"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session