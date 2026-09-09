import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from pydantic import model_validator

if TYPE_CHECKING:
    from app.models.transcript import Transcript
    from app.models.brief_record import ProjectBriefRecord
    from app.models.correction import CorrectionLog


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
    name: Optional[str] = Field(default=None, max_length=255)
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="before")
    @classmethod
    def validate_name_or_title(cls, data: Any) -> Any:
        if isinstance(data, dict):
            val = data.get("name") or data.get("title")
            if not val:
                raise ValueError("Project name or title is required")
            data["name"] = val
            data["title"] = val
        return data


class ProjectRead(ProjectBase):
    id: str
    created_at: str
    updated_at: str
    title: Optional[str] = None

    @model_validator(mode="after")
    def populate_title(self) -> "ProjectRead":
        if not self.title:
            self.title = self.name
        return self


class ProjectUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def normalize_title(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "title" in data and "name" not in data:
                data["name"] = data["title"]
        return data
