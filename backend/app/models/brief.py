from datetime import datetime, timezone
from enum import Enum
from typing import Literal
import uuid
from pydantic import BaseModel, Field


class SectionKeyEnum(str, Enum):
    EXECUTIVE_SUMMARY = "executive_summary"
    OBJECTIVES_SUCCESS_CRITERIA = "objectives_success_criteria"
    TARGET_AUDIENCE = "target_audience"
    SCOPE_OF_WORK = "scope_of_work"
    OUT_OF_SCOPE = "out_of_scope"
    TECHNICAL_ARCHITECTURE = "technical_architecture"
    ASSUMPTIONS_INFERENCES = "assumptions_inferences"
    RISKS_CONTRADICTIONS = "risks_contradictions"
    BUDGET_COMMERCIALS = "budget_commercials"
    TIMELINE_MILESTONES = "timeline_milestones"
    OUTSTANDING_QUESTIONS = "outstanding_questions"


SECTION_TITLES: dict[str, str] = {
    SectionKeyEnum.EXECUTIVE_SUMMARY.value: "Executive Summary & Client Background",
    SectionKeyEnum.OBJECTIVES_SUCCESS_CRITERIA.value: "Project Objectives & Success Criteria",
    SectionKeyEnum.TARGET_AUDIENCE.value: "Target Audience & User Personas",
    SectionKeyEnum.SCOPE_OF_WORK.value: "In-Scope Deliverables & Features",
    SectionKeyEnum.OUT_OF_SCOPE.value: "Out-of-Scope Boundaries",
    SectionKeyEnum.TECHNICAL_ARCHITECTURE.value: "Technical Architecture & Constraints",
    SectionKeyEnum.ASSUMPTIONS_INFERENCES.value: "Inferred Assumptions & Working Hypotheses",
    SectionKeyEnum.RISKS_CONTRADICTIONS.value: "Known Risks & Transcript Contradictions",
    SectionKeyEnum.BUDGET_COMMERCIALS.value: "Budget, Commercials & Payment Terms",
    SectionKeyEnum.TIMELINE_MILESTONES.value: "Timeline, Phases & Milestones",
    SectionKeyEnum.OUTSTANDING_QUESTIONS.value: "Outstanding Questions & Next Steps",
}


class BriefSection(BaseModel):
    """A structured section within the 11-section project brief."""
    key: str
    title: str
    content: str  # Markdown formatted text
    source_fact_ids: list[str] = Field(default_factory=list)
    inference_ids: list[str] = Field(default_factory=list)
    supporting_clarification_ids: list[str] = Field(default_factory=list)


class ProjectBrief(BaseModel):
    """The synthesized 11-section project brief with unified markdown export."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    transcript_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sections: dict[str, BriefSection] = Field(default_factory=dict)
    full_markdown: str = ""


class UserClarification(BaseModel):
    """User answers and resolved contradictions injected into synthesis."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_id: str
    resolved_text: str
    resolved_by: str = "user"


class CritiqueIssueType(str, Enum):
    UNGROUNDED_CLAIM = "ungrounded_claim"
    CONTRADICTION_NEGLECT = "contradiction_neglect"
    MISSING_CONSTRAINT = "missing_constraint"
    VAGUE_DELIVERABLE = "vague_deliverable"


class CritiqueIssue(BaseModel):
    """An advisory finding identified by the automated critique node."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_key: str
    issue_type: Literal[
        "ungrounded_claim",
        "contradiction_neglect",
        "missing_constraint",
        "vague_deliverable"
    ]
    severity: Literal["critical", "warning", "info"] = "warning"
    explanation: str
    suggested_fix: str


class CritiqueReport(BaseModel):
    """Advisory audit report for the drafted brief."""
    score: int = Field(ge=0, le=100)
    summary: str
    issues: list[CritiqueIssue] = Field(default_factory=list)


# Pydantic payloads for Groq structured output
class RawBriefSection(BaseModel):
    title: str = ""
    content: str = ""
    source_fact_ids: list[str] = Field(default_factory=list)
    inference_ids: list[str] = Field(default_factory=list)
    supporting_clarification_ids: list[str] = Field(default_factory=list)


class RawBriefPayload(BaseModel):
    sections: dict[str, RawBriefSection] = Field(default_factory=dict)


class RawCritiquePayload(BaseModel):
    score: int = Field(ge=0, le=100)
    summary: str
    issues: list[CritiqueIssue] = Field(default_factory=list)
