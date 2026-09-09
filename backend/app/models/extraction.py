from enum import Enum
from typing import Literal
import uuid
from pydantic import BaseModel, Field


class FactCategory(str, Enum):
    SCOPE = "scope"
    TIMELINE = "timeline"
    BUDGET = "budget"
    TECH_STACK = "tech_stack"
    TARGET_AUDIENCE = "target_audience"
    CONSTRAINTS = "constraints"
    INTEGRATIONS = "integrations"
    OTHER = "other"


class QuoteSpan(BaseModel):
    start_char: int
    end_char: int
    line_start: int
    line_end: int


class ConfirmedFact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: FactCategory
    statement: str
    source_quote: str
    speaker: str | None = None
    spans: list[QuoteSpan] = Field(default_factory=list)


class InferredPoint(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: FactCategory
    statement: str
    source_fact_ids: list[str] = Field(default_factory=list)
    rationale: str
    status: str = "inferred"


class UnknownGap(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: FactCategory
    missing_information: str
    impact_level: Literal["high", "medium", "low"]
    suggested_question: str


class UnverifiedCandidate(BaseModel):
    statement: str
    failed_quote: str
    speaker: str | None = None
    reason: str


class RawFactCandidate(BaseModel):
    statement: str = Field(description="Clear, declarative client fact stated during call")
    source_quote: str = Field(description="Exact verbatim contiguous substring quote from client transcript")
    speaker: str | None = Field(default=None, description="Speaker attribution if identifiable, excluding prefix from quote")
    category: FactCategory = Field(default=FactCategory.OTHER, description="Topic category for this fact")


class RawInferenceCandidate(BaseModel):
    statement: str = Field(description="Logical deduction inferred from stated facts")
    rationale: str = Field(description="Explanation of why this deduction follows from the stated facts")
    category: FactCategory = Field(default=FactCategory.OTHER, description="Topic category")
    supporting_fact_indices: list[int] = Field(default_factory=list, description="0-based indices of facts in the facts list that support this inference")


class RawUnknownCandidate(BaseModel):
    missing_information: str = Field(description="Critical detail or requirement not provided in transcript")
    impact_level: Literal["high", "medium", "low"] = Field(default="medium", description="Risk level of leaving this gap unaddressed")
    suggested_question: str = Field(description="Targeted question to ask the client to clarify this gap")
    category: FactCategory = Field(default=FactCategory.OTHER, description="Topic category")


class RawExtractionPayload(BaseModel):
    facts: list[RawFactCandidate] = Field(default_factory=list, description="All client-stated facts grounded with verbatim quotes")
    inferences: list[RawInferenceCandidate] = Field(default_factory=list, description="Deductions and implications derived from facts")
    unknowns: list[RawUnknownCandidate] = Field(default_factory=list, description="Missing scoping information and follow-up questions")


class ExtractionResult(BaseModel):
    confirmed_facts: list[ConfirmedFact] = Field(default_factory=list)
    inferred_points: list[InferredPoint] = Field(default_factory=list)
    unknown_gaps: list[UnknownGap] = Field(default_factory=list)
    unverified_candidates: list[UnverifiedCandidate] = Field(default_factory=list)
