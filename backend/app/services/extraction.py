from contextlib import contextmanager
from typing import Any, Generator
from langgraph.checkpoint.sqlite import SqliteSaver
from app.core.config import settings
from app.graph import build_extraction_graph, ExtractionState
from app.models.extraction import ExtractionResult
from app.models.brief import UserClarification
from app.services.transcript import normalize_transcript_text


from app.core.database import db_file_path


def _resolve_sqlite_path(db_url: str) -> str:
    """Extract filesystem path from a sqlite URL (e.g., sqlite:///path -> path)."""
    if db_file_path is not None:
        return str(db_file_path)
    if db_url.startswith("sqlite:///"):
        return db_url.replace("sqlite:///", "")
    return db_url


@contextmanager
def get_checkpointer(checkpointer: Any = None) -> Generator[Any, None, None]:
    """Yields active checkpointer, defaulting to SqliteSaver for settings.database_url."""
    if checkpointer is not None:
        yield checkpointer
    else:
        db_path = _resolve_sqlite_path(settings.database_url)
        with SqliteSaver.from_conn_string(db_path) as cp:
            yield cp


def run_extraction_pipeline(
    transcript_id: str,
    transcript_text: str,
    project_id: str = "",
    user_clarifications: list[UserClarification] | None = None,
    checkpointer: Any = None,
) -> ExtractionResult:
    """
    Executes the 6-node extraction, truth-grounding, and brief synthesis LangGraph pipeline (D-15).
    Normalizes transcript text, configures state, and persists checkpointer thread_id.
    """
    normalized_text = normalize_transcript_text(transcript_text)
    thread_id = f"project:{project_id}:transcript:{transcript_id}" if project_id else transcript_id

    initial_state: ExtractionState = {
        "transcript_id": transcript_id,
        "project_id": project_id,
        "transcript_text": normalized_text,
        "normalized_text": normalized_text,
        "confirmed_facts": [],
        "inferred_points": [],
        "unknown_gaps": [],
        "unverified_candidates": [],
        "contradictions": [],
        "unverified_contradictions": [],
        "clarification_questions": [],
        "user_clarifications": user_clarifications or [],
        "draft_brief": None,
        "critique_report": None,
        "retry_count": 0,
        "errors": [],
    }

    config = {
        "configurable": {
            "thread_id": thread_id,
        }
    }

    with get_checkpointer(checkpointer) as active_checkpointer:
        graph = build_extraction_graph(checkpointer=active_checkpointer)
        final_state = graph.invoke(initial_state, config=config)

    return ExtractionResult(
        confirmed_facts=final_state.get("confirmed_facts", []),
        inferred_points=final_state.get("inferred_points", []),
        unknown_gaps=final_state.get("unknown_gaps", []),
        unverified_candidates=final_state.get("unverified_candidates", []),
        contradictions=final_state.get("contradictions", []),
        unverified_contradictions=final_state.get("unverified_contradictions", []),
        clarification_questions=final_state.get("clarification_questions", []),
        user_clarifications=final_state.get("user_clarifications", []),
        draft_brief=final_state.get("draft_brief"),
        critique_report=final_state.get("critique_report"),
    )
