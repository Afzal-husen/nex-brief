from typing import TypedDict
from app.models.extraction import (
    ConfirmedFact,
    InferredPoint,
    UnknownGap,
    UnverifiedCandidate,
    RawExtractionPayload,
    Contradiction,
    UnverifiedContradiction,
    ClarificationQuestion,
)
from app.models.brief import (
    ProjectBrief,
    UserClarification,
    CritiqueReport,
)


class ExtractionState(TypedDict, total=False):
    """
    Central state container for the LangGraph extraction & brief synthesis pipeline.
    Tracks raw outputs, verified epistemic facts, deductions, gaps,
    contradictions, follow-up clarification questions, user clarifications,
    synthesized brief, and automated critique audit reports.
    """
    transcript_id: str
    project_id: str
    transcript_text: str
    normalized_text: str
    raw_payload: RawExtractionPayload | None
    confirmed_facts: list[ConfirmedFact]
    inferred_points: list[InferredPoint]
    unknown_gaps: list[UnknownGap]
    unverified_candidates: list[UnverifiedCandidate]
    contradictions: list[Contradiction]
    unverified_contradictions: list[UnverifiedContradiction]
    clarification_questions: list[ClarificationQuestion]
    user_clarifications: list[UserClarification]
    draft_brief: ProjectBrief | None
    critique_report: CritiqueReport | None
    retry_count: int
    errors: list[str]
