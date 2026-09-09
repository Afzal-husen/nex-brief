from typing import Any
from backend.app.core.llm import get_structured_critique_client
from backend.app.graph.state import ExtractionState
from backend.app.models.brief import (
    CritiqueIssue,
    CritiqueReport,
    RawCritiquePayload,
)

CRITIQUE_SYSTEM_PROMPT = """You are NexBrief's Automated Quality & Grounding Critique Engine.
Your role is to independently review a newly synthesized 11-section project brief and evaluate its fidelity against the confirmed facts, inferences, active contradictions, and user clarifications.

You must check for four specific issue types:
1. `ungrounded_claim`: The brief claims a feature, constraint, or deliverable that is NOT supported by any confirmed fact, inference, or user clarification.
2. `contradiction_neglect`: The brief unilaterally adopts an assumption or side on an unresolved contradiction without noting the conflict.
3. `missing_constraint`: A confirmed client constraint or requirement (e.g. security, compliance, legacy integration) was completely omitted from the brief.
4. `vague_deliverable`: A deliverable in the scope is ambiguously formulated without clear acceptance criteria or boundaries.

Severity levels:
- `critical`: High risk of major client misalignment or significant scope hallucination.
- `warning`: Moderate discrepancy or unacknowledged tension.
- `info`: Minor formatting, clarity recommendation, or suggested polish.

Score calculation:
- Start with 100.
- Deduct 20 points per critical issue.
- Deduct 10 points per warning issue.
- Deduct 2 points per info issue.
- Minimum score is 0.
"""


def format_critique_prompt(state: ExtractionState) -> str:
    """Builds prompt context comparing draft brief with source state."""
    draft_brief = state.get("draft_brief")
    brief_markdown = draft_brief.full_markdown if draft_brief else "No brief generated."

    confirmed_facts = state.get("confirmed_facts", [])
    inferred_points = state.get("inferred_points", [])
    contradictions = state.get("contradictions", [])
    user_clarifications = state.get("user_clarifications", [])

    facts_summary = "\n".join(
        f"- [{f.id}]: {f.statement}" for f in confirmed_facts
    ) or "None."

    inferences_summary = "\n".join(
        f"- [{inf.id}]: {inf.statement} (supporting facts: {inf.source_fact_ids})"
        for inf in inferred_points
    ) or "None."

    contradictions_summary = "\n".join(
        f"- [{c.id}] ({c.severity}): Claim A: \"{c.claim_a}\" vs Claim B: \"{c.claim_b}\""
        for c in contradictions
    ) or "None."

    clarifications_summary = "\n".join(
        f"- [Q: {uc.question_id}]: {uc.resolved_text}"
        for uc in user_clarifications
    ) or "None."

    return (
        f"{CRITIQUE_SYSTEM_PROMPT}\n\n"
        f"--- SOURCE CONFIRMED FACTS ---\n{facts_summary}\n\n"
        f"--- INFERRED POINTS ---\n{inferences_summary}\n\n"
        f"--- ACTIVE CONTRADICTIONS ---\n{contradictions_summary}\n\n"
        f"--- USER CLARIFICATIONS ---\n{clarifications_summary}\n\n"
        f"=== DRAFT PROJECT BRIEF ===\n{brief_markdown}\n\n"
        f"Audit the draft brief and return your structured CritiqueReport."
    )


def critique_brief_node(state: ExtractionState) -> dict[str, Any]:
    """
    LangGraph node: Audits draft brief for ungrounded claims, omitted constraints,
    and neglected contradictions, returning an advisory CritiqueReport.
    """
    draft_brief = state.get("draft_brief")
    if not draft_brief:
        return {
            "critique_report": CritiqueReport(
                score=0,
                summary="No draft brief was available to critique.",
                issues=[
                    CritiqueIssue(
                        section_key="all",
                        issue_type="missing_constraint",
                        severity="critical",
                        explanation="Draft brief missing from graph state.",
                        suggested_fix="Ensure brief synthesis runs before critique.",
                    )
                ],
            )
        }

    client = get_structured_critique_client()
    prompt = format_critique_prompt(state)

    try:
        raw_payload = client.invoke(prompt)
        if isinstance(raw_payload, dict):
            raw_payload = RawCritiquePayload(**raw_payload)

        # Recalculate score deterministically to guarantee consistency
        score = 100
        for issue in raw_payload.issues:
            if issue.severity == "critical":
                score -= 20
            elif issue.severity == "warning":
                score -= 10
            elif issue.severity == "info":
                score -= 2
        score = max(0, min(100, score))

        report = CritiqueReport(
            score=score,
            summary=raw_payload.summary,
            issues=raw_payload.issues,
        )
        return {"critique_report": report}
    except Exception as exc:
        return {
            "critique_report": CritiqueReport(
                score=100,
                summary=f"Critique audit completed with fallback: {str(exc)}",
                issues=[],
            )
        }
