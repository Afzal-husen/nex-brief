"""Tests for database engine initialization and connection pragmas."""
from sqlmodel import text
from app.core.database import engine, init_db


def test_sqlite_pragmas():
    """Verify WAL mode, busy timeout, and foreign keys on database engine connection."""
    with engine.connect() as conn:
        journal_mode = conn.execute(text("PRAGMA journal_mode;")).scalar()
        # In SQLite, journal_mode will be wal (or memory if configured in-memory)
        assert journal_mode.lower() in ("wal", "memory")

        busy_timeout = conn.execute(text("PRAGMA busy_timeout;")).scalar()
        assert busy_timeout == 5000

        foreign_keys = conn.execute(text("PRAGMA foreign_keys;")).scalar()
        assert foreign_keys == 1


def test_init_db_creates_tables():
    """Verify init_db creates all defined tables."""
    init_db()
    with engine.connect() as conn:
        tables = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table';")
        ).scalars().all()
        assert "projects" in tables
        assert "transcripts" in tables
