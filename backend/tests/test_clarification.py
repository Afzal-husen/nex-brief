from unittest.mock import MagicMock
import pytest
from backend.app.core.llm import (
    set_mock_clarification_client,
    clear_mock_clarification_client,
)
from backend.app.graph.clarification import generate_clarifications_node
from backend.app.models.extraction import (
    Contradiction,
    FactCategory,
    QuoteSpan,
    RawClarificationPayload,
    RawQuestionCandidate,
    UnknownGap,
)


@pytest.fixture(autouse=True)
def clean_mock():
    clear_mock_clarification_client()
    yield
    clear_mock_clarification_client()


def test_clarification_heuristic_ranking_order():
    direct_conflict = Contradiction(
        id="c-direct",
        category=FactCategory.TIMELINE,
        claim_a="Launch in June",
        quote_a="Launch in June",
        spans_a=[QuoteSpan(start_char=0, end_char=14, line_start=1, line_end=1)],
        claim_b="Start in August",
        quote_b="Start in August",
        spans_b=[QuoteSpan(start_char=20, end_char=35, line_start=2, line_end=2)],
        conflict_rationale="June launch impossible with August start",
        severity="direct_conflict",
    )
    tension_conflict = Contradiction(
        id="c-tension",
        category=FactCategory.TECH_STACK,
        claim_a="Prefers Python",
        quote_a="Prefers Python",
        spans_a=[QuoteSpan(start_char=40, end_char=54, line_start=3, line_end=3)],
        claim_b="Considering Go",
        quote_b="Considering Go",
        spans_b=[QuoteSpan(start_char=60, end_char=74, line_start=4, line_end=4)],
        conflict_rationale="Language stack indecision",
        severity="tension",
    )
    high_gap = UnknownGap(
        id="g-high",
        category=FactCategory.BUDGET,
        missing_information="Total project budget",
        impact_level="high",
        suggested_question="What is the total project budget?",
    )
    medium_gap = UnknownGap(
        id="g-med",
        category=FactCategory.CONSTRAINTS,
        missing_information="Target compliance certifications",
        impact_level="medium",
        suggested_question="Are there specific compliance requirements?",
    )
    low_gap = UnknownGap(
        id="g-low",
        category=FactCategory.OTHER,
        missing_information="Team internal meeting cadence",
        impact_level="low",
        suggested_question="What is your desired sync schedule?",
    )

    state = {
        "contradictions": [tension_conflict, direct_conflict],
        "unknown_gaps": [low_gap, medium_gap, high_gap],
    }

    result = generate_clarifications_node(state)
    questions = result["clarification_questions"]

    assert len(questions) == 5
    # Verification of heuristic tier ordering:
    # 1. Direct contradiction (c-direct)
    assert questions[0].priority == 1
    assert questions[0].target_id == "c-direct"
    assert questions[0].target_type == "contradiction"

    # 2. High-impact gap (g-high)
    assert questions[1].priority == 2
    assert questions[1].target_id == "g-high"
    assert questions[1].target_type == "unknown_gap"

    # 3. Tension contradiction (c-tension)
    assert questions[2].priority == 3
    assert questions[2].target_id == "c-tension"
    assert questions[2].target_type == "contradiction"

    # 4. Medium-impact gap (g-med)
    assert questions[3].priority == 4
    assert questions[3].target_id == "g-med"
    assert questions[3].target_type == "unknown_gap"

    # 5. Low-impact gap (g-low)
    assert questions[4].priority == 5
    assert questions[4].target_id == "g-low"
    assert questions[4].target_type == "unknown_gap"


def test_clarification_strict_cap_at_five():
    gaps = [
        UnknownGap(
            id=f"gap-{i}",
            category=FactCategory.SCOPE,
            missing_information=f"Requirement {i}",
            impact_level="high",
            suggested_question=f"Question {i}?",
        )
        for i in range(8)
    ]
    state = {"contradictions": [], "unknown_gaps": gaps}

    result = generate_clarifications_node(state)
    assert len(result["clarification_questions"]) == 5
    priorities = [q.priority for q in result["clarification_questions"]]
    assert priorities == [1, 2, 3, 4, 5]


def test_clarification_with_mocked_llm_synthesis():
    gap = UnknownGap(
        id="gap-cloud",
        category=FactCategory.BUDGET,
        missing_information="AWS cloud budget",
        impact_level="high",
        suggested_question="What is your cloud hosting budget?",
    )
    mock_client = MagicMock()
    mock_payload = RawClarificationPayload(
        questions=[
            RawQuestionCandidate(
                target_type="unknown_gap",
                target_id="gap-cloud",
                question="What monthly budget ceiling should we target for AWS cloud infrastructure?",
                rationale="Determines multi-region vs single-region architecture options.",
                suggested_options=["$500 - $1,000/mo", "$1,000 - $3,000/mo", "Self-hosted"],
            )
        ]
    )
    mock_client.invoke.return_value = mock_payload
    set_mock_clarification_client(mock_client)

    state = {"contradictions": [], "unknown_gaps": [gap]}
    result = generate_clarifications_node(state)

    assert len(result["clarification_questions"]) == 1
    q = result["clarification_questions"][0]
    assert q.priority == 1
    assert "monthly budget ceiling" in q.question
    assert len(q.suggested_options) == 3


def test_clarification_empty_state():
    state = {"contradictions": [], "unknown_gaps": []}
    result = generate_clarifications_node(state)
    assert result["clarification_questions"] == []
