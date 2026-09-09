from unittest.mock import MagicMock
import pytest
from backend.app.core.llm import set_mock_synthesis_client, clear_mock_synthesis_client
from backend.app.graph.nodes.synthesize_brief import synthesize_brief_node
from backend.app.graph.state import ExtractionState
from backend.app.models.brief import (
    RawBriefPayload,
    RawBriefSection,
    SectionKeyEnum,
    UserClarification,
)
from backend.app.models.extraction import (
    ConfirmedFact,
    FactCategory,
    QuoteSpan,
)


@pytest.fixture(autouse=True)
def clean_llm_mocks():
    yield
    clear_mock_synthesis_client()


def test_synthesize_brief_generates_all_11_sections():
    # Mock LLM returning valid 11 sections
    mock_sections = {}
    for key in SectionKeyEnum:
        mock_sections[key.value] = RawBriefSection(
            title=key.value.replace("_", " ").title(),
            content=f"Detailed generated content for {key.value}.",
            source_fact_ids=["fact-1"],
            inference_ids=[],
            supporting_clarification_ids=["clar-1"],
        )

    mock_client = MagicMock()
    mock_client.invoke.return_value = RawBriefPayload(sections=mock_sections)
    set_mock_synthesis_client(mock_client)

    state: ExtractionState = {
        "project_id": "proj-1",
        "transcript_id": "trans-1",
        "confirmed_facts": [
            ConfirmedFact(
                id="fact-1",
                category=FactCategory.SCOPE,
                statement="Client needs React dashboard",
                source_quote="we need React dashboard",
                spans=[QuoteSpan(start_char=0, end_char=23, line_start=1, line_end=1)],
            )
        ],
        "user_clarifications": [
            UserClarification(
                question_id="q-1",
                resolved_text="Budget is strictly $50k",
            )
        ],
    }

    result = synthesize_brief_node(state)
    assert "draft_brief" in result
    brief = result["draft_brief"]
    assert brief is not None
    assert len(brief.sections) == 11
    assert brief.sections[SectionKeyEnum.SCOPE_OF_WORK.value].source_fact_ids == ["fact-1"]
    assert brief.sections[SectionKeyEnum.SCOPE_OF_WORK.value].supporting_clarification_ids == ["clar-1"]
    assert "# Project Discovery Brief" in brief.full_markdown


def test_synthesize_brief_handles_unaddressed_sections():
    # Mock LLM returning payload with only executive summary and scope, leaving budget and timeline empty
    mock_sections = {
        SectionKeyEnum.EXECUTIVE_SUMMARY.value: RawBriefSection(
            title="Executive Summary & Client Background",
            content="Client wants a new platform.",
        ),
        SectionKeyEnum.SCOPE_OF_WORK.value: RawBriefSection(
            title="In-Scope Deliverables & Features",
            content="Feature A and Feature B.",
        ),
    }

    mock_client = MagicMock()
    mock_client.invoke.return_value = RawBriefPayload(sections=mock_sections)
    set_mock_synthesis_client(mock_client)

    state: ExtractionState = {
        "project_id": "proj-1",
        "transcript_id": "trans-1",
        "confirmed_facts": [],
    }

    result = synthesize_brief_node(state)
    brief = result["draft_brief"]
    assert brief is not None
    # Unaddressed section must fall back to "Not discussed in discovery call"
    budget_sec = brief.sections[SectionKeyEnum.BUDGET_COMMERCIALS.value]
    assert "Not discussed in discovery call" in budget_sec.content
    timeline_sec = brief.sections[SectionKeyEnum.TIMELINE_MILESTONES.value]
    assert "Not discussed in discovery call" in timeline_sec.content
