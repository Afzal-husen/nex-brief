import json
from datetime import datetime, timezone
from typing import Any
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.graph import build_extraction_graph, ExtractionState
from app.models.brief import (
    BriefSection,
    CritiqueReport,
    ProjectBrief,
    UserClarification,
)
from app.models.brief_record import ProjectBriefRecord
from app.models.correction import CorrectionLog
from app.models.extraction import (
    ClarificationQuestion,
    ConfirmedFact,
    Contradiction,
    InferredPoint,
    UnknownGap,
)
from app.models.project import Project, ProjectStatus
from app.models.transcript import Transcript
from app.services.diff_engine import compute_section_diffs
from app.services.extraction import get_checkpointer
from app.services.transcript import normalize_transcript_text


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def trigger_project_analysis(
    session: Session,
    project_id: str,
    checkpointer_override: Any = None,
) -> dict[str, Any]:
    """
    Executes pipeline up to interrupt_before=['synthesize_brief'] (CLARIFY-02).
    Updates project status to 'awaiting_clarification' and returns extracted facts and questions.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # Concurrency guard (D-12)
    if project.status in [ProjectStatus.ANALYZING, ProjectStatus.SYNTHESIZING]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analysis or synthesis already in progress for this project.",
        )

    # Transcript existence check (D-09)
    stmt = select(Transcript).where(Transcript.project_id == project_id).order_by(Transcript.created_at.desc())
    transcript = session.exec(stmt).first()
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transcript found for project. Submit transcript before running analysis.",
        )

    # Update status to analyzing
    project.status = ProjectStatus.ANALYZING
    project.updated_at = utc_now()
    session.add(project)
    session.commit()
    session.refresh(project)

    normalized_text = normalize_transcript_text(transcript.raw_text)
    thread_id = f"project:{project_id}:transcript:{transcript.id}"

    initial_state: ExtractionState = {
        "transcript_id": transcript.id,
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
        "user_clarifications": [],
        "draft_brief": None,
        "critique_report": None,
        "retry_count": 0,
        "errors": [],
    }

    config = {"configurable": {"thread_id": thread_id}}

    try:
        with get_checkpointer(checkpointer_override) as active_checkpointer:
            graph = build_extraction_graph(
                checkpointer=active_checkpointer,
                interrupt_before=["synthesize_brief"],
            )
            final_state = graph.invoke(initial_state, config=config)
    except Exception as exc:
        project.status = ProjectStatus.CREATED
        project.updated_at = utc_now()
        session.add(project)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline execution failed: {str(exc)}",
        )

    # Update status to awaiting_clarification
    project.status = ProjectStatus.AWAITING_CLARIFICATION
    project.updated_at = utc_now()
    session.add(project)
    session.commit()
    session.refresh(project)

    return {
        "project_id": project_id,
        "status": project.status,
        "confirmed_facts": final_state.get("confirmed_facts", []),
        "inferred_points": final_state.get("inferred_points", []),
        "contradictions": final_state.get("contradictions", []),
        "unknown_gaps": final_state.get("unknown_gaps", []),
        "clarification_questions": final_state.get("clarification_questions", []),
    }


def resume_project_with_clarifications(
    session: Session,
    project_id: str,
    clarifications: list[UserClarification],
    checkpointer_override: Any = None,
) -> dict[str, Any]:
    """
    Resumes graph execution from breakpoint after injecting user clarifications (CLARIFY-03).
    Executes synthesize_brief -> critique_brief -> END and saves ProjectBriefRecord.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # Valid status check (D-10)
    if project.status != ProjectStatus.AWAITING_CLARIFICATION:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Project is not awaiting clarification. Current status: {project.status}",
        )

    stmt = select(Transcript).where(Transcript.project_id == project_id).order_by(Transcript.created_at.desc())
    transcript = session.exec(stmt).first()
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transcript found for project.",
        )

    project.status = ProjectStatus.SYNTHESIZING
    project.updated_at = utc_now()
    session.add(project)
    session.commit()
    session.refresh(project)

    thread_id = f"project:{project_id}:transcript:{transcript.id}"
    config = {"configurable": {"thread_id": thread_id}}

    try:
        with get_checkpointer(checkpointer_override) as active_checkpointer:
            # Recompile with checkpointer to resume
            graph = build_extraction_graph(checkpointer=active_checkpointer)

            # Inject clarifications as of the breakpoint node
            graph.update_state(
                config,
                {"user_clarifications": clarifications},
                as_node="generate_clarifications",
            )

            # Resume execution to completion
            final_state = graph.invoke(None, config=config)
    except Exception as exc:
        project.status = ProjectStatus.AWAITING_CLARIFICATION
        project.updated_at = utc_now()
        session.add(project)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Brief synthesis resumption failed: {str(exc)}",
        )

    draft_brief: ProjectBrief | None = final_state.get("draft_brief")
    critique_report: CritiqueReport | None = final_state.get("critique_report")

    # Upsert ProjectBriefRecord (D-07)
    stmt_brief = select(ProjectBriefRecord).where(ProjectBriefRecord.project_id == project_id)
    brief_record = session.exec(stmt_brief).first()
    if not brief_record:
        brief_record = ProjectBriefRecord(
            project_id=project_id,
            status="draft",
        )

    brief_record.draft_brief_json = draft_brief.model_dump_json() if draft_brief else None
    brief_record.critique_report_json = critique_report.model_dump_json() if critique_report else None
    brief_record.updated_at = utc_now()
    session.add(brief_record)

    project.status = ProjectStatus.READY_FOR_REVIEW
    project.updated_at = utc_now()
    session.add(project)
    session.commit()
    session.refresh(project)
    session.refresh(brief_record)

    return {
        "project_id": project_id,
        "status": project.status,
        "draft_brief": draft_brief,
        "critique_report": critique_report,
    }


def get_project_brief_details(
    session: Session,
    project_id: str,
) -> dict[str, Any]:
    """
    Retrieves the current draft and approved brief with critique report (BRIEF-03).
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    stmt = select(ProjectBriefRecord).where(ProjectBriefRecord.project_id == project_id)
    record = session.exec(stmt).first()
    if not record or not record.draft_brief_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No brief has been generated for this project.",
        )

    draft_brief = json.loads(record.draft_brief_json) if record.draft_brief_json else None
    approved_brief = json.loads(record.approved_brief_json) if record.approved_brief_json else None
    critique_report = json.loads(record.critique_report_json) if record.critique_report_json else None

    return {
        "project_id": project_id,
        "status": record.status,
        "draft_brief": draft_brief,
        "approved_brief": approved_brief,
        "critique_report": critique_report,
        "approved_at": record.approved_at,
    }


def approve_project_brief(
    session: Session,
    project_id: str,
    edited_brief: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Finalizes human approval of brief, optionally saving user edits (BRIEF-04).
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    stmt = select(ProjectBriefRecord).where(ProjectBriefRecord.project_id == project_id)
    record = session.exec(stmt).first()
    if not record or not record.draft_brief_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No draft brief found to approve. Run analysis and clarification first.",
        )

    approval_time = utc_now()
    draft_dict = json.loads(record.draft_brief_json)
    if edited_brief:
        approved_dict = edited_brief
        record.approved_brief_json = json.dumps(edited_brief)
    else:
        approved_dict = draft_dict
        record.approved_brief_json = record.draft_brief_json

    record.status = "approved"
    record.approved_at = approval_time
    record.updated_at = approval_time
    session.add(record)

    # Compute and persist section-level diffs (EVAL-01 / Story 14)
    diff_records = compute_section_diffs(draft_dict, approved_dict)

    # Replace any prior correction logs for this project
    stmt_old_logs = select(CorrectionLog).where(CorrectionLog.project_id == project_id)
    old_logs = session.exec(stmt_old_logs).all()
    for old_log in old_logs:
        session.delete(old_log)

    for diff_item in diff_records:
        corr_log = CorrectionLog(
            project_id=project_id,
            section_key=diff_item["section_key"],
            draft_content=diff_item["draft_content"],
            approved_content=diff_item["approved_content"],
            has_changed=diff_item["has_changed"],
            diff_unified=diff_item["diff_unified"],
            character_delta=diff_item["character_delta"],
            similarity_ratio=diff_item["similarity_ratio"],
            created_at=approval_time,
        )
        session.add(corr_log)

    project.status = ProjectStatus.APPROVED
    project.updated_at = approval_time
    session.add(project)
    session.commit()
    session.refresh(project)
    session.refresh(record)

    return {
        "project_id": project_id,
        "status": project.status,
        "approved_at": record.approved_at,
        "approved_brief": json.loads(record.approved_brief_json),
    }
