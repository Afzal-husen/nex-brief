from unittest.mock import MagicMock
from langgraph.checkpoint.memory import MemorySaver
from backend.app.core.llm import set_mock_extraction_client, clear_mock_extraction_client
from backend.app.graph.extraction import build_extraction_graph, ExtractionState
from backend.app.models.extraction import (
    FactCategory,
    RawExtractionPayload,
    RawFactCandidate,
    RawInferenceCandidate,
    RawUnknownCandidate,
    ExtractionResult,
)
from backend.app.services.extraction import run_extraction_pipeline

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

        # Verify state persistence via checkpointer
        state_tuple = graph.get_state(config)
        assert state_tuple.values["confirmed_facts"] == confirmed
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
        ]
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
    finally:
        clear_mock_extraction_client()
