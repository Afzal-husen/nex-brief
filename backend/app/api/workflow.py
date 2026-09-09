from typing import Any
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.api.deps import get_session
from app.models.brief import (
    CritiqueReport,
    ProjectBrief,
    UserClarification,
)
from app.models.extraction import (
    ClarificationQuestion,
    ConfirmedFact,
    Contradiction,
    InferredPoint,
    UnknownGap,
)
from app.services.workflow import (
    approve_project_brief,
    get_project_analysis_details,
    get_project_brief_details,
    resume_project_with_clarifications,
    trigger_project_analysis,
)

router = APIRouter(tags=["workflow"])


class AnalyzeResponse(BaseModel):
    project_id: str
    status: str
    confirmed_facts: list[ConfirmedFact]
    inferred_points: list[InferredPoint]
    contradictions: list[Contradiction]
    unknown_gaps: list[UnknownGap]
    clarification_questions: list[ClarificationQuestion]


class ClarifyRequest(BaseModel):
    clarifications: list[UserClarification] = Field(default_factory=list)


class ClarifyResponse(BaseModel):
    project_id: str
    status: str
    draft_brief: ProjectBrief | None = None
    critique_report: CritiqueReport | None = None


class BriefResponse(BaseModel):
    project_id: str
    status: str
    draft_brief: Any = None
    approved_brief: Any = None
    critique_report: Any = None
    approved_at: str | None = None


class ApproveRequest(BaseModel):
    edited_brief: dict[str, Any] | None = None


class ApproveResponse(BaseModel):
    project_id: str
    status: str
    approved_at: str
    approved_brief: Any


@router.post(
    "/projects/{id}/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger analysis and pause at clarification interrupt",
)
def analyze_project(
    id: str,
    session: Session = Depends(get_session),
):
    """
    Triggers extraction pipeline up to clarification gate (CLARIFY-02).
    Halts execution before synthesis so the human can review facts and answer unknowns.
    """
    return trigger_project_analysis(session=session, project_id=id)


@router.get(
    "/projects/{id}/analysis",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current or checkpointed analysis results",
)
def get_analysis(
    id: str,
    session: Session = Depends(get_session),
):
    """
    Retrieves the latest extraction and analysis state for a project (UI-03, D-15).
    """
    return get_project_analysis_details(session=session, project_id=id)



@router.post(
    "/projects/{id}/clarify",
    response_model=ClarifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit user clarifications and resume brief synthesis",
)
def clarify_project(
    id: str,
    payload: ClarifyRequest,
    session: Session = Depends(get_session),
):
    """
    Injects human clarifications into checkpointed state and resumes graph
    to synthesize 11-section brief and generate critique report (CLARIFY-03).
    """
    return resume_project_with_clarifications(
        session=session,
        project_id=id,
        clarifications=payload.clarifications,
    )


@router.get(
    "/projects/{id}/brief",
    response_model=BriefResponse,
    status_code=status.HTTP_200_OK,
    summary="Inspect current draft or approved brief and critique report",
)
def get_brief(
    id: str,
    session: Session = Depends(get_session),
):
    """
    Retrieves draft brief, approved brief, and advisory critique notes (BRIEF-03).
    """
    return get_project_brief_details(session=session, project_id=id)


@router.post(
    "/projects/{id}/approve",
    response_model=ApproveResponse,
    status_code=status.HTTP_200_OK,
    summary="Approve brief with optional editorial changes",
)
def approve_brief(
    id: str,
    payload: ApproveRequest = ApproveRequest(),
    session: Session = Depends(get_session),
):
    """
    Records human approval and editorial changes, marking project status as approved (BRIEF-04).
    """
    return approve_project_brief(
        session=session,
        project_id=id,
        edited_brief=payload.edited_brief,
    )
