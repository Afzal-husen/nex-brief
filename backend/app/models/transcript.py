import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.project import Project


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class TranscriptBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    source_type: str = Field(default="direct_paste", max_length=50)


class Transcript(TranscriptBase, table=True):
    __tablename__ = "transcripts"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    project_id: str = Field(foreign_key="projects.id", index=True)
    raw_text: str = Field(...)
    normalized_text: str = Field(...)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)

    project: Optional["Project"] = Relationship(back_populates="transcripts")


class TranscriptCreate(TranscriptBase):
    raw_text: str = Field(min_length=1, max_length=100000)


class TranscriptRead(TranscriptBase):
    id: str
    project_id: str
    raw_text: str
    normalized_text: str
    created_at: str
    updated_at: str
