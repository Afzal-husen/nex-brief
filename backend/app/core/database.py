"""Database engine and session management with SQLite WAL mode."""
from pathlib import Path
from typing import Generator
from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings

# Parse file path from SQLite URL if local file
db_url = settings.DATABASE_URL
db_file_path: Path | None = None
if db_url.startswith("sqlite:///"):
    db_relative_path = db_url.replace("sqlite:///", "")
    # Check if absolute or relative
    db_file_path = Path(db_relative_path)
    if not db_file_path.is_absolute():
        # Anchored to project root or backend root
        backend_dir = Path(__file__).resolve().parent.parent.parent
        db_file_path = backend_dir / "data" / "nexbrief.db"
        db_url = f"sqlite:///{db_file_path.as_posix()}"
    db_file_path.parent.mkdir(parents=True, exist_ok=True)

# Create engine
engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False},
    echo=False,
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enforce WAL mode and busy timeout for concurrent access."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA busy_timeout=5000;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()


def init_db() -> None:
    """Initialize database tables registered with SQLModel."""
    from app.models.project import Project  # noqa: F401
    from app.models.transcript import Transcript  # noqa: F401
    from app.models.brief_record import ProjectBriefRecord  # noqa: F401
    from app.models.correction import CorrectionLog  # noqa: F401

    SQLModel.metadata.create_all(engine)

    # Lightweight auto-migration for existing SQLite databases
    with engine.begin() as conn:
        cursor = conn.connection.cursor()
        cursor.execute("PRAGMA table_info(projects)")
        cols = [row[1] for row in cursor.fetchall()]
        if "status" not in cols and "name" in cols:
            cursor.execute("ALTER TABLE projects ADD COLUMN status VARCHAR DEFAULT 'created'")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_projects_status ON projects (status)")
            conn.connection.commit()


def get_session() -> Generator[Session, None, None]:
    """Yield database session for request lifecycle."""
    with Session(engine) as session:
        yield session
