from typing import Any, TypedDict
from langgraph.graph import StateGraph, START, END
from backend.app.core.llm import get_structured_extraction_client, get_groq_llm
from backend.app.models.extraction import (
    ConfirmedFact,
    InferredPoint,
    UnknownGap,
    UnverifiedCandidate,
    RawExtractionPayload,
    FactCategory,
)
from backend.app.services.grounding import verify_candidate_facts


class ExtractionState(TypedDict, total=False):
    transcript_id: str
    project_id: str
    transcript_text: str
    raw_payload: RawExtractionPayload | None
    confirmed_facts: list[ConfirmedFact]
    inferred_points: list[InferredPoint]
    unknown_gaps: list[UnknownGap]
    unverified_candidates: list[UnverifiedCandidate]
    retry_count: int
    errors: list[str]


EXTRACTION_SYSTEM_PROMPT = """You are NexBrief's Truth-Grounded Knowledge Extraction Engine.
Your task is to analyze client discovery-call transcripts with epistemic rigor.

Instructions:
1. FACTS (Grounding Requirement):
   - Extract every explicit, declarative requirement or statement made by the client.
   - For each fact, provide `source_quote`: this MUST be an EXACT, CONTIGUOUS, VERBATIM substring from the transcript.
   - Strictly DO NOT use ellipsis ('...') or paraphrase client words.
   - Do NOT include speaker labels (e.g. 'Client:') inside `source_quote`; store speaker in the `speaker` field.
   - Classify into categories: scope, timeline, budget, tech_stack, target_audience, constraints, integrations, or other.

2. INFERENCES (Deductions):
   - Identify implicit requirements, technical deductions, or consequences that follow logically from stated facts.
   - Provide a clear `rationale` explaining why the deduction follows.
   - Include `supporting_fact_indices`: list the 0-based indices of the facts in your facts list that justify this deduction.

3. UNKNOWNS (Scoping Gaps):
   - Identify critical information missing from the transcript that is required to scope and build the project.
   - Rate `impact_level` as 'high', 'medium', or 'low'.
   - Formulate a precise `suggested_question` to ask the client during follow-up.

Be comprehensive, objective, and strictly grounded in what was said.
"""


def extract_knowledge(state: ExtractionState) -> dict[str, Any]:
    """
    First node: Invokes Groq structured output to extract raw candidate facts, inferences, and gaps.
    """
    transcript_text = state.get("transcript_text", "")
    if not transcript_text:
        return {
            "raw_payload": RawExtractionPayload(),
            "errors": ["Empty transcript text provided."],
        }

    client = get_structured_extraction_client()
    prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nClient Discovery Transcript:\n{transcript_text}"

    try:
        raw_payload = client.invoke(prompt)
        if isinstance(raw_payload, dict):
            raw_payload = RawExtractionPayload(**raw_payload)
        return {"raw_payload": raw_payload}
    except Exception as exc:
        return {
            "raw_payload": RawExtractionPayload(),
            "errors": [f"Extraction failed: {str(exc)}"],
        }


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


def build_extraction_graph(checkpointer: Any = None) -> Any:
    """
    Constructs and compiles the two-node LangGraph extraction state machine (D-20).
    """
    workflow = StateGraph(ExtractionState)

    workflow.add_node("extract_knowledge", extract_knowledge)
    workflow.add_node("verify_grounding", verify_grounding)

    workflow.add_edge(START, "extract_knowledge")
    workflow.add_edge("extract_knowledge", "verify_grounding")
    workflow.add_edge("verify_grounding", END)

    if checkpointer is not None:
        return workflow.compile(checkpointer=checkpointer)
    return workflow.compile()
