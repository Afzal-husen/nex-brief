from typing import Any
from langchain_core.messages import HumanMessage, SystemMessage

from backend.app.core.llm import get_structured_contradiction_client
from backend.app.models.extraction import (
    Contradiction,
    RawContradictionCandidate,
    RawContradictionPayload,
    UnverifiedContradiction,
)
from backend.app.services.grounding import find_quote_spans

CONTRADICTION_DETECTION_SYSTEM_PROMPT = """You are an expert project discovery analyst and epistemic auditor for NexBrief.
Your task is to review the client discovery call transcript and previously verified client facts to identify any INTERNAL CONTRADICTIONS, mutually exclusive requirements, or conflicting statements.

CRITICAL RULES:
1. Every contradiction must pair two distinct conflicting claims (claim_a vs claim_b).
2. For each claim, you MUST provide an exact, contiguous literal quote from the transcript (quote_a, quote_b).
3. Ellipsis ("..." or "…") are STRICTLY FORBIDDEN. Quotes must be contiguous substrings that exist literally in the transcript.
4. Distinguish between:
   - "direct_conflict": mutually exclusive statements (e.g. "We must launch by June" vs "We will not launch until Q4", or "Budget is $30k" vs "Minimum spend is $50k").
   - "tension": opposing preferences, friction, or difficult tradeoffs stated by the client that need alignment.
5. Provide a clear conflict_rationale explaining why these two statements cannot easily coexist.
6. If there are NO contradictions or conflicting statements in the transcript, return an empty contradictions list.
"""


def detect_contradictions_node(state: dict[str, Any]) -> dict[str, Any]:
    """
    LangGraph node that detects internal contradictions in discovery transcripts (EXTRACT-05),
    verifying verbatim quote substrings for both sides of the conflict.
    """
    normalized_text = state.get("normalized_text") or state.get("transcript_text", "")
    facts = state.get("confirmed_facts") or state.get("facts", [])

    if not normalized_text.strip():
        return {
            "contradictions": [],
            "unverified_contradictions": [],
        }

    # Format verified facts as reference context for the LLM
    facts_context = "\n".join(
        f"- [Fact {fact.id}] ({fact.category.value}): {fact.statement} (Quote: \"{fact.source_quote}\")"
        for fact in facts
    )

    prompt = (
        f"--- TRANSCRIPT ---\n{normalized_text}\n\n"
        f"--- PREVIOUSLY CONFIRMED FACTS ---\n{facts_context or 'No confirmed facts'}\n\n"
        "Identify any direct contradictions or statement tensions in the transcript above."
    )

    try:
        client = get_structured_contradiction_client()
        result: RawContradictionPayload = client.invoke([
            SystemMessage(content=CONTRADICTION_DETECTION_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ])
    except Exception:
        return {
            "contradictions": [],
            "unverified_contradictions": [],
        }

    verified_contradictions: list[Contradiction] = []
    unverified_contradictions: list[UnverifiedContradiction] = []

    candidates = getattr(result, "contradictions", [])

    for candidate in candidates:
        quote_a = candidate.quote_a.strip().strip('"\'')
        quote_b = candidate.quote_b.strip().strip('"\'')

        # Check for ellipsis prohibition (D-02)
        if "..." in quote_a or "…" in quote_a:
            unverified_contradictions.append(
                UnverifiedContradiction(
                    candidate=candidate,
                    error_reason="Ellipsis (...) is strictly forbidden in quote_a",
                )
            )
            continue

        if "..." in quote_b or "…" in quote_b:
            unverified_contradictions.append(
                UnverifiedContradiction(
                    candidate=candidate,
                    error_reason="Ellipsis (...) is strictly forbidden in quote_b",
                )
            )
            continue

        # Verify quote substrings in normalized text
        spans_a = find_quote_spans(normalized_text, quote_a)
        if not spans_a:
            unverified_contradictions.append(
                UnverifiedContradiction(
                    candidate=candidate,
                    error_reason=f"quote_a not found verbatim in transcript: '{quote_a}'",
                )
            )
            continue

        spans_b = find_quote_spans(normalized_text, quote_b)
        if not spans_b:
            unverified_contradictions.append(
                UnverifiedContradiction(
                    candidate=candidate,
                    error_reason=f"quote_b not found verbatim in transcript: '{quote_b}'",
                )
            )
            continue

        # Match to confirmed facts if available
        matched_fact_id_a: str | None = None
        matched_fact_id_b: str | None = None

        for fact in facts:
            if quote_a.lower() in fact.source_quote.lower() or fact.source_quote.lower() in quote_a.lower():
                matched_fact_id_a = fact.id
            if quote_b.lower() in fact.source_quote.lower() or fact.source_quote.lower() in quote_b.lower():
                matched_fact_id_b = fact.id

        verified_contradictions.append(
            Contradiction(
                claim_a=candidate.claim_a,
                quote_a=quote_a,
                spans_a=spans_a,
                fact_id_a=matched_fact_id_a,
                claim_b=candidate.claim_b,
                quote_b=quote_b,
                spans_b=spans_b,
                fact_id_b=matched_fact_id_b,
                conflict_rationale=candidate.conflict_rationale,
                severity=candidate.severity,
                category=candidate.category,
            )
        )

    return {
        "contradictions": verified_contradictions,
        "unverified_contradictions": unverified_contradictions,
    }
