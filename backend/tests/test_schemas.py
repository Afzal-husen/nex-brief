import uuid
from backend.app.models.extraction import (
    FactCategory,
    QuoteSpan,
    ConfirmedFact,
    InferredPoint,
    UnknownGap,
    UnverifiedCandidate,
    RawFactCandidate,
    RawInferenceCandidate,
    RawUnknownCandidate,
    RawExtractionPayload,
    ExtractionResult,
)


def test_fact_categories():
    assert FactCategory.SCOPE == "scope"
    assert FactCategory.TIMELINE == "timeline"
    assert FactCategory.BUDGET == "budget"
    assert FactCategory.TECH_STACK == "tech_stack"
    assert FactCategory.TARGET_AUDIENCE == "target_audience"
    assert FactCategory.CONSTRAINTS == "constraints"
    assert FactCategory.INTEGRATIONS == "integrations"
    assert FactCategory.OTHER == "other"


def test_quote_span_creation():
    span = QuoteSpan(start_char=10, end_char=50, line_start=2, line_end=4)
    assert span.start_char == 10
    assert span.end_char == 50
    assert span.line_start == 2
    assert span.line_end == 4


def test_confirmed_fact_defaults():
    fact = ConfirmedFact(
        category=FactCategory.TECH_STACK,
        statement="Client requires Next.js 16 with App Router",
        source_quote="We want to use Next.js 16 with the App Router",
        speaker="Client",
        spans=[QuoteSpan(start_char=0, end_char=44, line_start=1, line_end=1)],
    )
    assert fact.id is not None
    # Valid UUID check
    uuid_obj = uuid.UUID(fact.id)
    assert str(uuid_obj) == fact.id
    assert fact.category == FactCategory.TECH_STACK
    assert len(fact.spans) == 1


def test_inferred_point_linkage():
    fact_id = str(uuid.uuid4())
    inferred = InferredPoint(
        category=FactCategory.TIMELINE,
        statement="Launch deadline implies an MVP release within 8 weeks",
        source_fact_ids=[fact_id],
        rationale="Client stated November launch and call took place in September",
    )
    assert inferred.id is not None
    assert inferred.status == "inferred"
    assert inferred.source_fact_ids == [fact_id]
    assert "November launch" in inferred.rationale


def test_unknown_gap_attributes():
    gap = UnknownGap(
        category=FactCategory.BUDGET,
        missing_information="Expected infrastructure and cloud hosting budget",
        impact_level="high",
        suggested_question="Do you have an allocated cloud hosting budget for AWS/Vercel?",
    )
    assert gap.id is not None
    assert gap.impact_level == "high"
    assert gap.category == FactCategory.BUDGET


def test_unverified_candidate():
    candidate = UnverifiedCandidate(
        statement="Client mentioned Kubernetes deployment",
        failed_quote="We run everything on K8s",
        speaker="Lead Architect",
        reason="Quote not found in transcript after retry",
    )
    assert candidate.failed_quote == "We run everything on K8s"
    assert candidate.reason == "Quote not found in transcript after retry"


def test_raw_extraction_payload_and_result():
    raw_payload = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Client needs SQLite for initial storage",
                source_quote="Let's start with SQLite",
                speaker="Sarah",
                category=FactCategory.TECH_STACK,
            )
        ],
        inferences=[
            RawInferenceCandidate(
                statement="Data volume is expected to be small initially",
                rationale="SQLite was chosen over distributed Postgres",
                category=FactCategory.TECH_STACK,
                supporting_fact_indices=[0],
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Maximum concurrent users",
                impact_level="medium",
                suggested_question="What is the expected peak concurrency?",
                category=FactCategory.CONSTRAINTS,
            )
        ],
    )
    assert len(raw_payload.facts) == 1
    assert len(raw_payload.inferences) == 1
    assert len(raw_payload.unknowns) == 1

    result = ExtractionResult()
    assert result.confirmed_facts == []
    assert result.inferred_points == []
    assert result.unknown_gaps == []
    assert result.unverified_candidates == []
