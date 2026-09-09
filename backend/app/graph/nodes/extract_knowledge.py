from typing import Any
from backend.app.core.llm import get_structured_extraction_client
from backend.app.graph.state import ExtractionState
from backend.app.models.extraction import RawExtractionPayload

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
