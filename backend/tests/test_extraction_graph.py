from unittest.mock import MagicMock
from langgraph.checkpoint.memory import MemorySaver
from app.core.llm import set_mock_extraction_client, clear_mock_extraction_client
from app.graph.extraction import build_extraction_graph, ExtractionState
from app.models.extraction import (
    FactCategory,
    RawExtractionPayload,
    RawFactCandidate,
    RawInferenceCandidate,
    RawUnknownCandidate,
    ExtractionResult,
)
from app.services.extraction import run_extraction_pipeline

SAMPLE_TRANSCRIPT = (
    "Client: We want a project brief generator.\n"
    "Agency: That sounds interesting. What tech stack do you prefer?\n"
    "Client: Python with FastAPI and Next.js 16.\n"
    "Agency: Got it. What is your budget limit?\n"
    "Client: We have around $50,000 budgeted."
)


def test_extraction_graph_execution_with_mock():
    mock_client = MagicMock()
    mock_client.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Client wants Python with FastAPI and Next.js 16",
                source_quote="Python with FastAPI and Next.js 16",
                speaker="Client",
                category=FactCategory.TECH_STACK,
            ),
            RawFactCandidate(
                statement="Project budget is around $50,000",
                source_quote="We have around $50,000 budgeted",
                speaker="Client",
                category=FactCategory.BUDGET,
            ),
        ],
        inferences=[
            RawInferenceCandidate(
                statement="Full-stack development capabilities needed",
                rationale="Stack combines FastAPI backend with Next.js frontend",
                category=FactCategory.TECH_STACK,
                supporting_fact_indices=[0],
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Deployment target infrastructure (AWS, GCP, Vercel)",
                impact_level="high",
                suggested_question="Where do you plan to host the backend and frontend?",
                category=FactCategory.TECH_STACK,
            )
        ],
    )

    set_mock_extraction_client(mock_client)
    try:
        checkpointer = MemorySaver()
        graph = build_extraction_graph(checkpointer=checkpointer)

        initial_state: ExtractionState = {
            "transcript_id": "test-transcript-123",
            "project_id": "test-project-123",
            "transcript_text": SAMPLE_TRANSCRIPT,
            "retry_count": 0,
            "errors": [],
        }

        config = {"configurable": {"thread_id": "test-transcript-123"}}
        final_state = graph.invoke(initial_state, config=config)

        # Assert facts confirmed and spans attached
        confirmed = final_state["confirmed_facts"]
        assert len(confirmed) == 2
        assert confirmed[0].source_quote == "Python with FastAPI and Next.js 16"
        assert len(confirmed[0].spans) == 1
        assert confirmed[0].spans[0].line_start == 3

        # Assert inferences linked to fact ID
        inferences = final_state["inferred_points"]
        assert len(inferences) == 1
        assert inferences[0].source_fact_ids == [confirmed[0].id]
        assert inferences[0].status == "inferred"

        # Assert unknowns populated
        unknowns = final_state["unknown_gaps"]
        assert len(unknowns) == 1
        assert unknowns[0].impact_level == "high"

        # Assert clarification questions generated in 4-node pipeline
        questions = final_state.get("clarification_questions", [])
        assert len(questions) == 1
        assert questions[0].target_id == unknowns[0].id
        assert questions[0].priority == 1

        # Verify state persistence via checkpointer
        state_tuple = graph.get_state(config)
        assert state_tuple.values["confirmed_facts"] == confirmed
        assert state_tuple.values["clarification_questions"] == questions
    finally:
        clear_mock_extraction_client()


def test_zero_facts_emits_fallback_unknown():
    mock_client = MagicMock()
    # Mock empty raw facts (e.g. casual conversation)
    mock_client.invoke.return_value = RawExtractionPayload(
        facts=[],
        inferences=[],
        unknowns=[],
    )

    set_mock_extraction_client(mock_client)
    try:
        checkpointer = MemorySaver()
        graph = build_extraction_graph(checkpointer=checkpointer)

        initial_state: ExtractionState = {
            "transcript_id": "empty-transcript-001",
            "project_id": "project-001",
            "transcript_text": "Alice: How is the weather? Bob: It's sunny today.",
            "retry_count": 0,
            "errors": [],
        }

        config = {"configurable": {"thread_id": "empty-transcript-001"}}
        final_state = graph.invoke(initial_state, config=config)

        assert len(final_state["confirmed_facts"]) == 0
        # D-15: Fallback UnknownGap created
        assert len(final_state["unknown_gaps"]) == 1
        assert "no verifiable project requirements" in final_state["unknown_gaps"][0].missing_information
        # Question generated targeting the fallback gap
        assert len(final_state["clarification_questions"]) == 1
    finally:
        clear_mock_extraction_client()


def test_run_extraction_pipeline_service():
    mock_client = MagicMock()
    mock_client.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Client budgeted $50,000",
                source_quote="We have around $50,000 budgeted",
                speaker="Client",
                category=FactCategory.BUDGET,
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Deployment target infrastructure",
                impact_level="high",
                suggested_question="Where should this be hosted?",
                category=FactCategory.TECH_STACK,
            )
        ],
    )

    set_mock_extraction_client(mock_client)
    try:
        memory_cp = MemorySaver()
        result: ExtractionResult = run_extraction_pipeline(
            transcript_id="svc-transcript-001",
            transcript_text=SAMPLE_TRANSCRIPT,
            project_id="proj-001",
            checkpointer=memory_cp,
        )

        assert isinstance(result, ExtractionResult)
        assert len(result.confirmed_facts) == 1
        assert result.confirmed_facts[0].source_quote == "We have around $50,000 budgeted"
        assert len(result.clarification_questions) == 1
        assert result.clarification_questions[0].target_type == "unknown_gap"
    finally:
        clear_mock_extraction_client()


def test_pipeline_detects_contradictions_and_prioritizes_questions():
    from app.core.llm import (
        set_mock_contradiction_client,
        clear_mock_contradiction_client,
    )
    from app.models.extraction import (
        RawContradictionCandidate,
        RawContradictionPayload,
    )

    transcript = (
        "Client: We must launch by June 30th.\n"
        "Agency: Can your team start immediately?\n"
        "Client: Unfortunately nobody can start until August."
    )

    mock_extract = MagicMock()
    mock_extract.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Must launch by June 30th",
                source_quote="We must launch by June 30th.",
                speaker="Client",
                category=FactCategory.TIMELINE,
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Cloud budget allocation",
                impact_level="high",
                suggested_question="What is the budget?",
                category=FactCategory.BUDGET,
            )
        ],
    )

    mock_contradict = MagicMock()
    mock_contradict.invoke.return_value = RawContradictionPayload(
        contradictions=[
            RawContradictionCandidate(
                claim_a="Launch by June 30th",
                quote_a="We must launch by June 30th.",
                claim_b="Cannot start until August",
                quote_b="nobody can start until August.",
                conflict_rationale="June 30th launch conflicts with August start",
                severity="direct_conflict",
                category=FactCategory.TIMELINE,
            )
        ]
    )

    set_mock_extraction_client(mock_extract)
    set_mock_contradiction_client(mock_contradict)
    try:
        memory_cp = MemorySaver()
        result = run_extraction_pipeline(
            transcript_id="conflict-test-01",
            transcript_text=transcript,
            checkpointer=memory_cp,
        )

        assert len(result.confirmed_facts) == 1
        assert len(result.contradictions) == 1
        assert result.contradictions[0].severity == "direct_conflict"
        assert len(result.contradictions[0].spans_a) == 1
        assert len(result.contradictions[0].spans_b) == 1

        # Priority 1: Contradiction, Priority 2: Unknown gap
        assert len(result.clarification_questions) == 2
        assert result.clarification_questions[0].priority == 1
        assert result.clarification_questions[0].target_type == "contradiction"
        assert result.clarification_questions[0].target_id == result.contradictions[0].id
        assert result.clarification_questions[1].priority == 2
        assert result.clarification_questions[1].target_type == "unknown_gap"
    finally:
        clear_mock_extraction_client()
        clear_mock_contradiction_client()
