"""Core application configuration and database engine."""
from backend.app.core.config import settings
from backend.app.core.database import engine, get_session, init_db

__all__ = ["settings", "engine", "get_session", "init_db"]
