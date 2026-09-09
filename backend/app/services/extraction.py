from contextlib import contextmanager
from typing import Any, Generator
from langgraph.checkpoint.sqlite import SqliteSaver
from backend.app.core.config import settings
from backend.app.graph.extraction import build_extraction_graph, ExtractionState
from backend.app.models.extraction import ExtractionResult
from backend.app.services.transcript import normalize_transcript_text


def _resolve_sqlite_path(db_url: str) -> str:
    """Extract filesystem path from a sqlite URL (e.g., sqlite:///path -> path)."""
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
    checkpointer: Any = None,
) -> ExtractionResult:
    """
    Executes the two-node extraction and truth-grounding LangGraph pipeline (D-26).
    Normalizes transcript text, configures state, and persists checkpointer thread_id = transcript_id.
    """
    normalized_text = normalize_transcript_text(transcript_text)

    initial_state: ExtractionState = {
        "transcript_id": transcript_id,
        "project_id": project_id,
        "transcript_text": normalized_text,
        "retry_count": 0,
        "errors": [],
    }

    config = {
        "configurable": {
            "thread_id": transcript_id,
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
    )
