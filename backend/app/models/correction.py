import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.project import Project


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class CorrectionLog(SQLModel, table=True):
    """
    Persistent relational record of section-level differences between
    initial draft briefs and human-approved edits (EVAL-01 / Story 14).
    """
    __tablename__ = "correction_logs"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    project_id: str = Field(
        foreign_key="projects.id",
        index=True,
    )
    section_key: str = Field(index=True)
    draft_content: str
    approved_content: str
    has_changed: bool = Field(default=False, index=True)
    diff_unified: Optional[str] = Field(default=None)
    character_delta: int = Field(default=0)
    similarity_ratio: float = Field(default=1.0)
    created_at: str = Field(default_factory=utc_now)

    project: Optional["Project"] = Relationship(back_populates="correction_logs")
