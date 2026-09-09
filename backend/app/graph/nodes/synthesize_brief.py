from typing import Any
from app.core.llm import get_structured_synthesis_client
from app.graph.state import ExtractionState
from app.models.brief import (
    BriefSection,
    ProjectBrief,
    RawBriefPayload,
    SECTION_TITLES,
    SectionKeyEnum,
)

SYNTHESIS_SYSTEM_PROMPT = """You are NexBrief's Project Brief Synthesis Engine.
Your role is to synthesize a professional, comprehensive 11-section project brief from client discovery-call extraction state.

The 11 required sections (use exact keys in the dictionary):
1. executive_summary: Executive Summary & Client Background
2. objectives_success_criteria: Project Objectives & Success Criteria
3. target_audience: Target Audience & User Personas
4. scope_of_work: In-Scope Deliverables & Features
5. out_of_scope: Out-of-Scope Boundaries
6. technical_architecture: Technical Architecture & Constraints
7. assumptions_inferences: Inferred Assumptions & Working Hypotheses
8. risks_contradictions: Known Risks & Transcript Contradictions
9. budget_commercials: Budget, Commercials & Payment Terms
10. timeline_milestones: Timeline, Phases & Milestones
11. outstanding_questions: Outstanding Questions & Next Steps

Core Synthesis Rules:
1. GROUNDING & FIDELITY:
   - Ground claims in confirmed facts and cite supporting `source_fact_ids`.
   - Include `inference_ids` for items derived from inferences.
   - For user clarifications, treat them as authoritative facts overriding previous ambiguities, and record `supporting_clarification_ids`.

2. UNADDRESSED SECTION RULE:
   - If the transcript contains NO information for a specific section (e.g., budget or timeline was never discussed), DO NOT invent, hallucinate, or assume arbitrary numbers/dates.
   - For unaddressed sections, explicitly begin content with: "Not discussed in discovery call." and list the open questions or missing unknowns that must be clarified.

3. COHESIVENESS:
   - Write clear, executive-grade Markdown with bullet points, subheaders, and bold highlights where appropriate.
   - Ensure the narrative connects logically across all 11 sections.
"""


def format_synthesis_prompt(state: ExtractionState) -> str:
    """Builds comprehensive structured context for the synthesis LLM."""
    confirmed_facts = state.get("confirmed_facts", [])
    inferred_points = state.get("inferred_points", [])
    contradictions = state.get("contradictions", [])
    unknown_gaps = state.get("unknown_gaps", [])
    clarification_questions = state.get("clarification_questions", [])
    user_clarifications = state.get("user_clarifications", [])

    facts_block = "\n".join(
        f"- [{f.id}] ({f.category.value}): {f.statement} (Quote: \"{f.source_quote}\")"
        for f in confirmed_facts
    ) or "No confirmed facts available."

    inferences_block = "\n".join(
        f"- [{inf.id}] ({inf.category.value}): {inf.statement} (Rationale: {inf.rationale}, Facts: {inf.source_fact_ids})"
        for inf in inferred_points
    ) or "None."

    contradictions_block = "\n".join(
        f"- [{c.id}] ({c.severity}): Claim A: \"{c.claim_a}\" vs Claim B: \"{c.claim_b}\" | Conflict: {c.conflict_rationale}"
        for c in contradictions
    ) or "None."

    unknowns_block = "\n".join(
        f"- [{u.id}] ({u.impact_level} impact): {u.missing_information} | Question: {u.suggested_question}"
        for u in unknown_gaps
    ) or "None."

    questions_block = "\n".join(
        f"- [{q.id}] (Priority {q.priority}): {q.question} | Rationale: {q.rationale}"
        for q in clarification_questions
    ) or "None."

    clarifications_block = "\n".join(
        f"- [Question ID: {uc.question_id}]: {uc.resolved_text}"
        for uc in user_clarifications
    ) or "No user clarifications provided."

    return (
        f"{SYNTHESIS_SYSTEM_PROMPT}\n\n"
        f"--- CONFIRMED CLIENT FACTS ---\n{facts_block}\n\n"
        f"--- INFERRED DEDUCTIONS ---\n{inferences_block}\n\n"
        f"--- ACTIVE CONTRADICTIONS ---\n{contradictions_block}\n\n"
        f"--- SCOPING UNKNOWNS & GAPS ---\n{unknowns_block}\n\n"
        f"--- PRIORITIZED FOLLOW-UP QUESTIONS ---\n{questions_block}\n\n"
        f"=== USER CLARIFICATIONS & RESOLUTIONS ===\n{clarifications_block}\n\n"
        f"Synthesize the complete 11-section project brief using all provided context."
    )


def compile_full_markdown(sections: dict[str, BriefSection]) -> str:
    """Compiles all 11 brief sections into a unified markdown export."""
    lines = ["# Project Discovery Brief\n"]
    for key, title in SECTION_TITLES.items():
        sec = sections.get(key)
        if sec:
            lines.append(f"## {sec.title}\n\n{sec.content.strip()}\n")
    return "\n".join(lines)


def synthesize_brief_node(state: ExtractionState) -> dict[str, Any]:
    """
    LangGraph node: Synthesizes the complete 11-section project brief grounded in facts,
    inferences, and user clarifications, compiling both structured sections and full markdown.
    """
    project_id = state.get("project_id", "")
    transcript_id = state.get("transcript_id", "")

    client = get_structured_synthesis_client()
    prompt = format_synthesis_prompt(state)

    try:
        raw_payload = client.invoke(prompt)
        if isinstance(raw_payload, dict):
            raw_payload = RawBriefPayload(**raw_payload)
    except Exception as exc:
        raw_payload = RawBriefPayload()

    # Build final 11-section dictionary, enforcing all keys exist
    sections: dict[str, BriefSection] = {}
    for enum_key, default_title in SECTION_TITLES.items():
        raw_sec = raw_payload.sections.get(enum_key)
        if raw_sec and raw_sec.content.strip():
            sections[enum_key] = BriefSection(
                key=enum_key,
                title=raw_sec.title or default_title,
                content=raw_sec.content,
                source_fact_ids=raw_sec.source_fact_ids,
                inference_ids=raw_sec.inference_ids,
                supporting_clarification_ids=raw_sec.supporting_clarification_ids,
            )
        else:
            # Fallback for missing section per D-02
            sections[enum_key] = BriefSection(
                key=enum_key,
                title=default_title,
                content="Not discussed in discovery call. Requires follow-up clarification.",
                source_fact_ids=[],
                inference_ids=[],
                supporting_clarification_ids=[],
            )

    full_markdown = compile_full_markdown(sections)

    brief = ProjectBrief(
        project_id=project_id,
        transcript_id=transcript_id,
        sections=sections,
        full_markdown=full_markdown,
    )

    return {"draft_brief": brief}
