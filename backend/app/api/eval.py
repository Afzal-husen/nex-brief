import json
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlmodel import Session

from backend.app.api.deps import get_session
from backend.app.models.correction import CorrectionLog
from backend.app.services.eval_service import (
    get_correction_logs,
    get_evaluation_dataset,
)

router = APIRouter()


@router.get("/corrections", response_model=list[CorrectionLog])
def list_corrections(
    project_id: Optional[str] = Query(default=None, description="Filter by project ID"),
    changed_only: bool = Query(default=False, description="Only return sections that were modified"),
    session: Session = Depends(get_session),
) -> list[CorrectionLog]:
    """
    Retrieves stored section-level correction records (EVAL-01).
    """
    return get_correction_logs(
        session=session,
        project_id=project_id,
        changed_only=changed_only,
    )


@router.get("/export")
def export_evaluation_dataset(
    project_id: Optional[str] = Query(default=None, description="Filter by project ID"),
    changed_only: bool = Query(default=True, description="Only export sections that were modified"),
    session: Session = Depends(get_session),
) -> Response:
    """
    Exports evaluation benchmark dataset formatted as JSON Lines (JSONL) (EVAL-02 / Story 14).
    """
    dataset = get_evaluation_dataset(
        session=session,
        project_id=project_id,
        changed_only=changed_only,
    )

    lines = [json.dumps(record, ensure_ascii=False) for record in dataset]
    content = "\n".join(lines) + ("\n" if lines else "")

    return Response(
        content=content,
        media_type="application/x-ndjson",
        headers={
            "Content-Disposition": 'attachment; filename="evaluation_dataset.jsonl"'
        },
    )
