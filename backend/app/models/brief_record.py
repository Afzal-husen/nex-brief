import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.project import Project


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ProjectBriefRecord(SQLModel, table=True):
    """
    Persistent relational record for project briefs, critique reports,
    and human approvals.
    """
    __tablename__ = "project_briefs"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    project_id: str = Field(
        foreign_key="projects.id",
        index=True,
        unique=True,
    )
    draft_brief_json: Optional[str] = Field(default=None)
    approved_brief_json: Optional[str] = Field(default=None)
    critique_report_json: Optional[str] = Field(default=None)
    status: str = Field(default="draft", index=True)
    approved_at: Optional[str] = Field(default=None)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)

    project: Optional["Project"] = Relationship(back_populates="brief_record")
