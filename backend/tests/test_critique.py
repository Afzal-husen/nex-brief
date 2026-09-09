from unittest.mock import MagicMock
import pytest
from backend.app.core.llm import set_mock_critique_client, clear_mock_critique_client
from backend.app.graph.nodes.critique_brief import critique_brief_node
from backend.app.graph.state import ExtractionState
from backend.app.models.brief import (
    BriefSection,
    CritiqueIssue,
    ProjectBrief,
    RawCritiquePayload,
    SectionKeyEnum,
)
from backend.app.models.extraction import (
    ConfirmedFact,
    FactCategory,
    QuoteSpan,
)


@pytest.fixture(autouse=True)
def clean_llm_mocks():
    yield
    clear_mock_critique_client()


def test_critique_brief_evaluates_and_deducts_score():
    mock_payload = RawCritiquePayload(
        score=70,
        summary="Found one critical ungrounded claim and one warning.",
        issues=[
            CritiqueIssue(
                section_key="scope_of_work",
                issue_type="ungrounded_claim",
                severity="critical",
                explanation="Deliverable mentions crypto payments not found in facts.",
                suggested_fix="Remove crypto payments or verify with client.",
            ),
            CritiqueIssue(
                section_key="technical_architecture",
                issue_type="vague_deliverable",
                severity="warning",
                explanation="Microservices architecture is not clearly bounded.",
                suggested_fix="Specify service boundaries.",
            ),
        ],
    )

    mock_client = MagicMock()
    mock_client.invoke.return_value = mock_payload
    set_mock_critique_client(mock_client)

    sections = {
        SectionKeyEnum.SCOPE_OF_WORK.value: BriefSection(
            key="scope_of_work",
            title="Scope",
            content="Crypto payments integration.",
        )
    }

    brief = ProjectBrief(
        project_id="p1",
        transcript_id="t1",
        sections=sections,
        full_markdown="# Brief\n\n## Scope\nCrypto payments integration.",
    )

    state: ExtractionState = {
        "project_id": "p1",
        "transcript_id": "t1",
        "draft_brief": brief,
        "confirmed_facts": [
            ConfirmedFact(
                category=FactCategory.SCOPE,
                statement="Client wants payment gateway",
                source_quote="we need payment gateway",
                spans=[QuoteSpan(start_char=0, end_char=22, line_start=1, line_end=1)],
            )
        ],
    }

    result = critique_brief_node(state)
    assert "critique_report" in result
    report = result["critique_report"]
    assert report is not None
    # 100 - 20 (critical) - 10 (warning) = 70
    assert report.score == 70
    assert len(report.issues) == 2
    assert report.issues[0].issue_type == "ungrounded_claim"


def test_critique_brief_handles_missing_brief():
    state: ExtractionState = {
        "project_id": "p1",
        "transcript_id": "t1",
        "draft_brief": None,
    }

    result = critique_brief_node(state)
    report = result["critique_report"]
    assert report is not None
    assert report.score == 0
    assert len(report.issues) == 1
    assert report.issues[0].severity == "critical"
