import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

# Ensure default GROQ_API_KEY is present for offline unit tests
os.environ.setdefault("GROQ_API_KEY", "gsk_dummy_key_for_testing")

from sqlalchemy import event

# Create in-memory SQLite engine for tests with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enforce foreign keys in SQLite test engine."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()



@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    """Provide a clean isolated in-memory database session for each test."""
    # Ensure all models are registered
    from backend.app.models.project import Project  # noqa: F401
    from backend.app.models.transcript import Transcript  # noqa: F401

    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Provide a TestClient with the database session dependency overridden."""
    from backend.app.api.deps import get_db
    from backend.app.main import app

    def get_session_override():
        yield session

    app.dependency_overrides[get_db] = get_session_override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
