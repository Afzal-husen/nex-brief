from typing import TypedDict
from backend.app.models.extraction import (
    ConfirmedFact,
    InferredPoint,
    UnknownGap,
    UnverifiedCandidate,
    RawExtractionPayload,
    Contradiction,
    UnverifiedContradiction,
    ClarificationQuestion,
)


class ExtractionState(TypedDict, total=False):
    """
    Central state container for the LangGraph extraction pipeline.
    Tracks raw outputs, verified epistemic facts, deductions, gaps,
    contradictions, and follow-up clarification questions.
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
    retry_count: int
    errors: list[str]
