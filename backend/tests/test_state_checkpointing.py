from pathlib import Path
from unittest.mock import MagicMock
import pytest
from langgraph.checkpoint.sqlite import SqliteSaver

from app.core.llm import (
    set_mock_extraction_client,
    clear_mock_extraction_client,
    set_mock_synthesis_client,
    clear_mock_synthesis_client,
    set_mock_critique_client,
    clear_mock_critique_client,
)
from app.graph.builder import build_extraction_graph
from app.graph.state import ExtractionState
from app.models.brief import (
    RawBriefPayload,
    RawBriefSection,
    RawCritiquePayload,
    CritiqueIssue,
    SectionKeyEnum,
    UserClarification,
)
from app.models.extraction import (
    FactCategory,
    RawExtractionPayload,
    RawFactCandidate,
    RawUnknownCandidate,
)
from app.services.extraction import run_extraction_pipeline


@pytest.fixture(autouse=True)
def clean_mocks():
    yield
    clear_mock_extraction_client()
    clear_mock_synthesis_client()
    clear_mock_critique_client()


def test_sqlite_checkpoint_state_recovery_across_restarts(tmp_path: Path):
    """
    Validates requirement DATA-04 and Success Criterion 3:
    LangGraph checkpoints state to SQLite, allowing resumption across process restarts.
    """
    db_path = str(tmp_path / "checkpoints_recovery_test.db")
    thread_id = "project:proj-test-1:transcript:trans-test-1"
    config = {"configurable": {"thread_id": thread_id}}

    # 1. Setup mock extraction
    mock_extract = MagicMock()
    mock_extract.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Must support single sign-on",
                source_quote="Must support single sign-on",
                speaker="Client",
                category=FactCategory.TECH_STACK,
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Which identity provider (Okta, Azure AD)?",
                impact_level="high",
                suggested_question="Which identity provider do you use for SSO?",
                category=FactCategory.TECH_STACK,
            )
        ],
    )
    set_mock_extraction_client(mock_extract)

    # 2. Setup mock synthesis & critique
    mock_sections = {}
    for key in SectionKeyEnum:
        mock_sections[key.value] = RawBriefSection(
            title=key.value.replace("_", " ").title(),
            content=f"Section content for {key.value}",
            source_fact_ids=["fact-1"],
            supporting_clarification_ids=["clar-1"],
        )
    mock_synth = MagicMock()
    mock_synth.invoke.return_value = RawBriefPayload(sections=mock_sections)
    set_mock_synthesis_client(mock_synth)

    mock_critique = MagicMock()
    mock_critique.invoke.return_value = RawCritiquePayload(
        score=90,
        summary="Minor polish suggestion.",
        issues=[
            CritiqueIssue(
                section_key="technical_architecture",
                issue_type="vague_deliverable",
                severity="info",
                explanation="Specify SSO protocol (SAML vs OIDC).",
                suggested_fix="Clarify with client whether SAML or OIDC is required.",
            )
        ],
    )
    set_mock_critique_client(mock_critique)

    transcript = "Client: Must support single sign-on for our team."

    # --- SIMULATE PROCESS 1: Run graph and write initial state ---
    with SqliteSaver.from_conn_string(db_path) as cp1:
        graph1 = build_extraction_graph(checkpointer=cp1)
        initial_state: ExtractionState = {
            "transcript_id": "trans-test-1",
            "project_id": "proj-test-1",
            "transcript_text": transcript,
            "normalized_text": transcript,
            "confirmed_facts": [],
            "inferred_points": [],
            "unknown_gaps": [],
            "unverified_candidates": [],
            "contradictions": [],
            "unverified_contradictions": [],
            "clarification_questions": [],
            "user_clarifications": [],
            "retry_count": 0,
            "errors": [],
        }
        res1 = graph1.invoke(initial_state, config=config)
        assert len(res1["confirmed_facts"]) == 1
        assert res1["draft_brief"] is not None
        assert res1["critique_report"] is not None

    # Process 1 has ended, graph1 and cp1 connection are closed.

    # --- SIMULATE PROCESS 2: Re-open fresh checkpointer on same DB file ---
    with SqliteSaver.from_conn_string(db_path) as cp2:
        graph2 = build_extraction_graph(checkpointer=cp2)

        # Retrieve checkpointed state for thread_id
        checkpointed_state = graph2.get_state(config)
        assert checkpointed_state is not None
        values = checkpointed_state.values

        # Verify state was restored from SQLite
        assert len(values["confirmed_facts"]) == 1
        assert values["confirmed_facts"][0].source_quote == "Must support single sign-on"
        assert len(values["clarification_questions"]) == 1
        assert values["draft_brief"] is not None
        assert values["critique_report"].score == 98  # 100 - 2 (info) = 98

        # Inject user clarification into the restored state and re-invoke
        clarification = UserClarification(
            question_id=values["clarification_questions"][0].id,
            resolved_text="We use Okta OIDC for authentication.",
        )
        updated_state = dict(values)
        updated_state["user_clarifications"] = [clarification]

        res2 = graph2.invoke(updated_state, config=config)

        # Check final synthesized brief contains user clarifications
        assert res2["draft_brief"] is not None
        assert len(res2["user_clarifications"]) == 1
        assert res2["user_clarifications"][0].resolved_text == "We use Okta OIDC for authentication."


def test_run_extraction_pipeline_with_sqlite_checkpointer(tmp_path: Path):
    db_path = str(tmp_path / "pipeline_sqlite_test.db")
    mock_extract = MagicMock()
    mock_extract.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Budget is $25k",
                source_quote="Budget is $25k",
                speaker="Client",
                category=FactCategory.BUDGET,
            )
        ],
        unknowns=[],
    )
    set_mock_extraction_client(mock_extract)

    mock_synth = MagicMock()
    mock_synth.invoke.return_value = RawBriefPayload(
        sections={
            SectionKeyEnum.BUDGET_COMMERCIALS.value: RawBriefSection(
                title="Budget, Commercials & Payment Terms",
                content="Client budget is $25,000 fixed fee.",
            )
        }
    )
    set_mock_synthesis_client(mock_synth)

    with SqliteSaver.from_conn_string(db_path) as cp:
        result = run_extraction_pipeline(
            transcript_id="t-abc",
            transcript_text="Client: Budget is $25k for the pilot.",
            project_id="p-xyz",
            checkpointer=cp,
        )

        assert result.draft_brief is not None
        assert len(result.confirmed_facts) == 1
        assert result.confirmed_facts[0].source_quote == "Budget is $25k"
        assert result.critique_report is not None
