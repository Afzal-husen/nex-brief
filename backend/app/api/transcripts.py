"""Transcripts API router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.api.deps import get_db
from app.models.project import Project
from app.models.transcript import (
    Transcript,
    TranscriptCreate,
    TranscriptRead,
)
from app.services.transcript import normalize_transcript_text

router = APIRouter(tags=["transcripts"])


@router.post(
    "/projects/{project_id}/transcripts",
    response_model=TranscriptRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transcript(
    project_id: str,
    transcript_in: TranscriptCreate,
    db: Session = Depends(get_db),
):
    """Ingest and normalize a transcript for a given project."""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id '{project_id}' not found",
        )

    # Normalize text while preserving speaker labels and quotes
    normalized_text = normalize_transcript_text(transcript_in.raw_text)

    transcript = Transcript(
        title=transcript_in.title,
        source_type=transcript_in.source_type,
        raw_text=transcript_in.raw_text,
        normalized_text=normalized_text,
        project_id=project_id,
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript


@router.get(
    "/projects/{project_id}/transcripts",
    response_model=List[TranscriptRead],
)
def list_project_transcripts(
    project_id: str,
    db: Session = Depends(get_db),
):
    """List all transcripts belonging to a project."""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id '{project_id}' not found",
        )

    statement = (
        select(Transcript)
        .where(Transcript.project_id == project_id)
        .order_by(Transcript.created_at.desc())
    )
    transcripts = db.exec(statement).all()
    return transcripts


@router.get(
    "/transcripts/{transcript_id}",
    response_model=TranscriptRead,
)
def get_transcript(
    transcript_id: str,
    db: Session = Depends(get_db),
):
    """Get transcript details by ID."""
    transcript = db.get(Transcript, transcript_id)
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transcript with id '{transcript_id}' not found",
        )
    return transcript
