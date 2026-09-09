"""FastAPI dependency injection utilities."""
from typing import Generator
from fastapi import Depends
from sqlmodel import Session
from backend.app.core.database import get_session


def get_db() -> Generator[Session, None, None]:
    """Provide a database session dependency for route handlers."""
    yield from get_session()
