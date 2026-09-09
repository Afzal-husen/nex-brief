"""Tests for Project and Transcript models and constraints."""
import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from backend.app.models.project import Project, ProjectCreate
from backend.app.models.transcript import Transcript, TranscriptCreate


def test_create_project(session: Session):
    """Verify Project creation with UUID and auto-timestamps."""
    project_data = ProjectCreate(name="E-Commerce Redesign", description="Redesign shop portal")
    project = Project.model_validate(project_data)
    session.add(project)
    session.commit()
    session.refresh(project)

    assert project.id is not None
    assert len(project.id) == 36  # UUID4 string format
    assert project.name == "E-Commerce Redesign"
    assert project.description == "Redesign shop portal"
    assert project.created_at is not None
    assert project.updated_at is not None


def test_create_transcript_linked_to_project(session: Session):
    """Verify Transcript creation linked to a parent Project."""
    project = Project(name="CRM Discovery", description="New CRM scoping")
    session.add(project)
    session.commit()
    session.refresh(project)

    transcript_data = TranscriptCreate(
        title="Kickoff Call",
        source_type="direct_paste",
        raw_text="Client: We need a new CRM.",
    )
    transcript = Transcript(
        title=transcript_data.title,
        source_type=transcript_data.source_type,
        raw_text=transcript_data.raw_text,
        normalized_text="Client: We need a new CRM.",
        project_id=project.id,
    )
    session.add(transcript)
    session.commit()
    session.refresh(transcript)

    assert transcript.id is not None
    assert transcript.project_id == project.id
    assert transcript.title == "Kickoff Call"
    assert transcript.raw_text == "Client: We need a new CRM."
    assert transcript.normalized_text == "Client: We need a new CRM."


def test_transcript_foreign_key_constraint(session: Session):
    """Verify foreign key constraint failure when referencing a non-existent project."""
    transcript = Transcript(
        title="Invalid Call",
        source_type="direct_paste",
        raw_text="Random text",
        normalized_text="Random text",
        project_id="non-existent-project-id",
    )
    session.add(transcript)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()


def test_project_cascade_delete(session: Session):
    """Verify deleting a Project cascades and deletes its linked Transcripts."""
    project = Project(name="Phase Out Project")
    session.add(project)
    session.commit()
    session.refresh(project)

    transcript = Transcript(
        title="Old Discovery",
        raw_text="Old requirements",
        normalized_text="Old requirements",
        project_id=project.id,
    )
    session.add(transcript)
    session.commit()

    transcript_id = transcript.id

    # Delete project
    session.delete(project)
    session.commit()

    # Query transcript
    statement = select(Transcript).where(Transcript.id == transcript_id)
    deleted_transcript = session.exec(statement).first()
    assert deleted_transcript is None
