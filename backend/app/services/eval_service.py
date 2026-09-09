import json
from typing import Any, Optional
from sqlmodel import Session, select

from backend.app.models.brief_record import ProjectBriefRecord
from backend.app.models.correction import CorrectionLog
from backend.app.models.transcript import Transcript
from backend.app.services.extraction import get_checkpointer


def get_correction_logs(
    session: Session,
    project_id: Optional[str] = None,
    changed_only: bool = False,
) -> list[CorrectionLog]:
    """
    Queries correction logs from SQLite, optionally filtered by project_id and changed_only.
    """
    stmt = select(CorrectionLog)
    if project_id:
        stmt = stmt.where(CorrectionLog.project_id == project_id)
    if changed_only:
        stmt = stmt.where(CorrectionLog.has_changed == True)

    stmt = stmt.order_by(CorrectionLog.created_at.desc())
    return list(session.exec(stmt).all())


def get_evaluation_dataset(
    session: Session,
    project_id: Optional[str] = None,
    changed_only: bool = True,
    checkpointer_override: Any = None,
) -> list[dict[str, Any]]:
    """
    Builds paired evaluation benchmark dataset records (Story 14 / EVAL-02)
    containing full transcript context, confirmed fact quotes, agent draft,
    human edits, and diff analytics.
    """
    logs = get_correction_logs(session, project_id=project_id, changed_only=changed_only)

    dataset: list[dict[str, Any]] = []

    # Cache transcript and quotes by project_id to avoid redundant queries
    project_cache: dict[str, dict[str, Any]] = {}

    for log in logs:
        pid = log.project_id
        if pid not in project_cache:
            transcript_stmt = select(Transcript).where(Transcript.project_id == pid)
            transcript_record = session.exec(transcript_stmt).first()
            transcript_text = (
                transcript_record.normalized_text or transcript_record.raw_text
                if transcript_record
                else ""
            )

            # Retrieve confirmed fact quotes from checkpoint state if available
            confirmed_quotes: list[str] = []
            try:
                with get_checkpointer(checkpointer_override) as cp:
                    state = cp.get({"configurable": {"thread_id": pid}})
                    if state and "channel_values" in state:
                        facts = state["channel_values"].get("confirmed_facts", [])
                        for fact in facts:
                            quote = getattr(fact, "source_quote", None)
                            if not quote and isinstance(fact, dict):
                                quote = fact.get("source_quote")
                            if quote and quote not in confirmed_quotes:
                                confirmed_quotes.append(quote)
            except Exception:
                confirmed_quotes = []

            project_cache[pid] = {
                "transcript_context": transcript_text,
                "confirmed_fact_quotes": confirmed_quotes,
            }

        cached = project_cache[pid]

        record = {
            "project_id": log.project_id,
            "section_key": log.section_key,
            "transcript_context": cached["transcript_context"],
            "confirmed_fact_quotes": cached["confirmed_fact_quotes"],
            "initial_agent_output": log.draft_content,
            "human_corrected_output": log.approved_content,
            "has_changed": log.has_changed,
            "similarity_ratio": log.similarity_ratio,
            "character_delta": log.character_delta,
            "diff_unified": log.diff_unified,
            "created_at": log.created_at,
        }
        dataset.append(record)

    return dataset
