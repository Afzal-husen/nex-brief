from typing import Any
from backend.app.core.llm import get_groq_llm
from backend.app.graph.state import ExtractionState
from backend.app.models.extraction import (
    ConfirmedFact,
    FactCategory,
    InferredPoint,
    RawExtractionPayload,
    UnknownGap,
)
from backend.app.services.grounding import verify_candidate_facts


def verify_grounding(state: ExtractionState) -> dict[str, Any]:
    """
    Second node: Programmatically verifies quote substrings, handles single retry, links inferences, and flags gaps.
    """
    transcript_text = state.get("transcript_text", "")
    raw_payload = state.get("raw_payload") or RawExtractionPayload()

    # Attempt to get an LLM client for targeted retry if needed
    retry_llm = None
    try:
        retry_llm = get_groq_llm(model="llama-3.1-8b-instant", temperature=0.0)
    except Exception:
        pass

    # 1. Verify candidate facts
    confirmed_facts, unverified_candidates = verify_candidate_facts(
        transcript_text=transcript_text,
        candidates=raw_payload.facts,
        llm_client=retry_llm,
    )

    # 2. Process inferences: map supporting fact indices to actual confirmed fact IDs
    inferred_points: list[InferredPoint] = []
    for raw_inf in raw_payload.inferences:
        linked_fact_ids: list[str] = []
        for idx in raw_inf.supporting_fact_indices:
            if 0 <= idx < len(confirmed_facts):
                linked_fact_ids.append(confirmed_facts[idx].id)

        inferred_points.append(
            InferredPoint(
                category=raw_inf.category,
                statement=raw_inf.statement,
                source_fact_ids=linked_fact_ids,
                rationale=raw_inf.rationale,
                status="inferred",
            )
        )

    # 3. Process unknowns
    unknown_gaps: list[UnknownGap] = []
    for raw_unk in raw_payload.unknowns:
        unknown_gaps.append(
            UnknownGap(
                category=raw_unk.category,
                missing_information=raw_unk.missing_information,
                impact_level=raw_unk.impact_level,
                suggested_question=raw_unk.suggested_question,
            )
        )

    # 4. Zero-fact safeguard (D-15):
    if len(confirmed_facts) == 0:
        unknown_gaps.append(
            UnknownGap(
                category=FactCategory.OTHER,
                missing_information="Transcript contained no verifiable project requirements",
                impact_level="high",
                suggested_question="Could you provide an overview of the core goals and requirements for this project?",
            )
        )

    return {
        "confirmed_facts": confirmed_facts,
        "inferred_points": inferred_points,
        "unknown_gaps": unknown_gaps,
        "unverified_candidates": unverified_candidates,
    }
