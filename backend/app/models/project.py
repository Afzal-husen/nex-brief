import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from backend.app.models.transcript import Transcript
    from backend.app.models.brief_record import ProjectBriefRecord
    from backend.app.models.correction import CorrectionLog


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ProjectStatus:
    CREATED = "created"
    ANALYZING = "analyzing"
    AWAITING_CLARIFICATION = "awaiting_clarification"
    SYNTHESIZING = "synthesizing"
    READY_FOR_REVIEW = "ready_for_review"
    APPROVED = "approved"


class ProjectBase(SQLModel):
    name: str = Field(index=True, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default=ProjectStatus.CREATED, index=True)


class Project(ProjectBase, table=True):
    __tablename__ = "projects"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)

    transcripts: List["Transcript"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    brief_record: Optional["ProjectBriefRecord"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "uselist": False},
    )
    correction_logs: List["CorrectionLog"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProjectCreate(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)


class ProjectRead(ProjectBase):
    id: str
    created_at: str
    updated_at: str


class ProjectUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = Field(default=None)
