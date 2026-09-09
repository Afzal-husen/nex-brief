from typing import Any, Literal
from langchain_core.messages import HumanMessage, SystemMessage

from backend.app.core.llm import get_structured_clarification_client
from backend.app.models.extraction import (
    ClarificationQuestion,
    Contradiction,
    RawClarificationPayload,
    UnknownGap,
)

QUESTION_SYNTHESIS_SYSTEM_PROMPT = """You are an expert technical consultant and discovery analyst for NexBrief.
You are given a prioritized list of client contradictions and project scoping unknowns.
Your goal is to formulate 3-5 sharp, professional, and actionable follow-up questions for the client.

For each targeted item:
1. Formulate a clear, direct question that empowers the client to make a concrete decision.
2. Provide a concise rationale explaining why this issue blocks the project definition, scope, or timeline.
3. Provide 2-3 concrete suggested options or choices to make it easy for the client to reply quickly.
4. Keep the target_type ("contradiction" or "unknown_gap") and target_id exactly as provided.
"""


def _score_candidate(item: Contradiction | UnknownGap) -> tuple[int, str]:
    """
    Severity & Scoping Impact Heuristic (D-08):
    Tier 1: Direct contradictions (highest project execution risk)
    Tier 2: High-impact unknown gaps (budget, timeline, core deliverables)
    Tier 3: Tension contradictions (opposing preferences)
    Tier 4: Medium-impact unknown gaps
    Tier 5: Low-impact unknown gaps
    """
    if isinstance(item, Contradiction):
        if item.severity == "direct_conflict":
            return (1, item.id)
        return (3, item.id)
    else:
        if item.impact_level == "high":
            return (2, item.id)
        elif item.impact_level == "medium":
            return (4, item.id)
        return (5, item.id)


def generate_clarifications_node(state: dict[str, Any]) -> dict[str, Any]:
    """
    LangGraph node that generates and ranks the top 3-5 prioritized follow-up questions
    targeting identified contradictions and unknowns (CLARIFY-01).
    """
    contradictions: list[Contradiction] = state.get("contradictions", [])
    unknown_gaps: list[UnknownGap] = state.get("unknown_gaps", [])

    all_candidates: list[Contradiction | UnknownGap] = []
    all_candidates.extend(contradictions)
    all_candidates.extend(unknown_gaps)

    if not all_candidates:
        return {"clarification_questions": []}

    # Sort candidates by impact priority tier
    sorted_candidates = sorted(all_candidates, key=_score_candidate)

    # Cap to top 5 candidates (D-09)
    top_candidates = sorted_candidates[:5]

    # Build prompt for LLM refinement
    candidate_descriptions: list[str] = []
    fallback_questions: list[ClarificationQuestion] = []

    for rank, item in enumerate(top_candidates, start=1):
        if isinstance(item, Contradiction):
            target_type: Literal["contradiction", "unknown_gap"] = "contradiction"
            desc = (
                f"Target {rank} [contradiction] (ID: {item.id}, Severity: {item.severity}, Category: {item.category.value}):\n"
                f"  Claim A: \"{item.claim_a}\" (Quote: \"{item.quote_a}\")\n"
                f"  Claim B: \"{item.claim_b}\" (Quote: \"{item.quote_b}\")\n"
                f"  Rationale: {item.conflict_rationale}"
            )
            default_q = f"How should we resolve the conflict between '{item.claim_a}' and '{item.claim_b}'?"
            default_opts = [item.claim_a, item.claim_b, "Alternative compromise"]
            default_rat = item.conflict_rationale
        else:
            target_type = "unknown_gap"
            desc = (
                f"Target {rank} [unknown_gap] (ID: {item.id}, Impact: {item.impact_level}, Category: {item.category.value}):\n"
                f"  Missing: {item.missing_information}\n"
                f"  Suggested: {item.suggested_question}"
            )
            default_q = item.suggested_question
            default_opts = []
            default_rat = f"Clarification needed on missing {item.category.value} specification: {item.missing_information}"

        candidate_descriptions.append(desc)
        fallback_questions.append(
            ClarificationQuestion(
                priority=rank,
                target_type=target_type,
                target_id=item.id,
                question=default_q,
                rationale=default_rat,
                suggested_options=default_opts,
            )
        )

    # Invoke Groq structured client to synthesize professional questions
    prompt = (
        "Here are the prioritized discovery blockers requiring follow-up questions:\n\n"
        + "\n\n".join(candidate_descriptions)
        + "\n\nFormulate the top questions targeting these exact items."
    )

    try:
        client = get_structured_clarification_client()
        result: RawClarificationPayload = client.invoke([
            SystemMessage(content=QUESTION_SYNTHESIS_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ])

        raw_questions = getattr(result, "questions", [])
        if not raw_questions:
            return {"clarification_questions": fallback_questions}

        final_questions: list[ClarificationQuestion] = []
        for rank, raw_q in enumerate(raw_questions[:5], start=1):
            final_questions.append(
                ClarificationQuestion(
                    priority=rank,
                    target_type=raw_q.target_type,
                    target_id=raw_q.target_id,
                    question=raw_q.question,
                    rationale=raw_q.rationale,
                    suggested_options=raw_q.suggested_options or [],
                )
            )

        # If LLM returned fewer than candidates and fallback has more, ensure valid questions
        if len(final_questions) > 0:
            return {"clarification_questions": final_questions}
        return {"clarification_questions": fallback_questions}

    except Exception:
        # Graceful fallback to deterministic questions if LLM unavailable
        return {"clarification_questions": fallback_questions}
