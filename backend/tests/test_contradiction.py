from unittest.mock import MagicMock
import pytest
from app.core.llm import (
    set_mock_contradiction_client,
    clear_mock_contradiction_client,
)
from app.graph.contradiction import detect_contradictions_node
from app.models.extraction import (
    ConfirmedFact,
    FactCategory,
    QuoteSpan,
    RawContradictionCandidate,
    RawContradictionPayload,
)


@pytest.fixture(autouse=True)
def clean_mock_client():
    clear_mock_contradiction_client()
    yield
    clear_mock_contradiction_client()


def test_detect_contradictions_success():
    transcript = (
        "Client: We need to launch the MVP by June 30th without exception.\n"
        "Lead: Understood, June 30th.\n"
        "Client: Also, our internal engineering team cannot start until August."
    )
    mock_payload = RawContradictionPayload(
        contradictions=[
            RawContradictionCandidate(
                claim_a="Must launch MVP by June 30th",
                quote_a="We need to launch the MVP by June 30th without exception.",
                claim_b="Engineering cannot start until August",
                quote_b="our internal engineering team cannot start until August.",
                conflict_rationale="June 30th launch is impossible if development cannot begin until August.",
                severity="direct_conflict",
                category=FactCategory.TIMELINE,
            )
        ]
    )
    mock_client = MagicMock()
    mock_client.invoke.return_value = mock_payload
    set_mock_contradiction_client(mock_client)

    state = {
        "normalized_text": transcript,
        "facts": [
            ConfirmedFact(
                category=FactCategory.TIMELINE,
                statement="Launch by June 30th",
                source_quote="We need to launch the MVP by June 30th without exception.",
                spans=[QuoteSpan(start_char=8, end_char=66, line_start=1, line_end=1)],
            )
        ],
    }

    result = detect_contradictions_node(state)
    assert len(result["contradictions"]) == 1
    assert len(result["unverified_contradictions"]) == 0

    c = result["contradictions"][0]
    assert c.claim_a == "Must launch MVP by June 30th"
    assert c.severity == "direct_conflict"
    assert len(c.spans_a) == 1
    assert len(c.spans_b) == 1
    assert c.fact_id_a is not None  # Matched existing ConfirmedFact
    assert c.fact_id_b is None


def test_detect_contradictions_rejects_ellipsis():
    transcript = "Client: We want Python on backend and we might use Go later."
    mock_payload = RawContradictionPayload(
        contradictions=[
            RawContradictionCandidate(
                claim_a="Backend is Python",
                quote_a="We want Python ... use Go later.",
                claim_b="Backend is Go",
                quote_b="we might use Go later.",
                conflict_rationale="Ellipsis test",
                severity="tension",
                category=FactCategory.TECH_STACK,
            )
        ]
    )
    mock_client = MagicMock()
    mock_client.invoke.return_value = mock_payload
    set_mock_contradiction_client(mock_client)

    state = {"normalized_text": transcript, "facts": []}
    result = detect_contradictions_node(state)

    assert len(result["contradictions"]) == 0
    assert len(result["unverified_contradictions"]) == 1
    assert "Ellipsis (...) is strictly forbidden" in result["unverified_contradictions"][0].error_reason


def test_detect_contradictions_rejects_missing_quote():
    transcript = "Client: We want a budget of $50k."
    mock_payload = RawContradictionPayload(
        contradictions=[
            RawContradictionCandidate(
                claim_a="Budget is $50k",
                quote_a="We want a budget of $50k.",
                claim_b="Budget is $20k",
                quote_b="Our budget cannot exceed $20k.",  # Not in transcript
                conflict_rationale="Conflicting budget amounts",
                severity="direct_conflict",
                category=FactCategory.BUDGET,
            )
        ]
    )
    mock_client = MagicMock()
    mock_client.invoke.return_value = mock_payload
    set_mock_contradiction_client(mock_client)

    state = {"normalized_text": transcript, "facts": []}
    result = detect_contradictions_node(state)

    assert len(result["contradictions"]) == 0
    assert len(result["unverified_contradictions"]) == 1
    assert "quote_b not found verbatim" in result["unverified_contradictions"][0].error_reason


def test_detect_contradictions_empty_when_no_conflicts():
    transcript = "Client: We are building a simple portfolio website with Next.js."
    mock_payload = RawContradictionPayload(contradictions=[])
    mock_client = MagicMock()
    mock_client.invoke.return_value = mock_payload
    set_mock_contradiction_client(mock_client)

    state = {"normalized_text": transcript, "facts": []}
    result = detect_contradictions_node(state)

    assert result["contradictions"] == []
    assert result["unverified_contradictions"] == []
