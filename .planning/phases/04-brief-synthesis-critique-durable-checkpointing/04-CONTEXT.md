# Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the 11-section brief synthesis node, automated critique audit node, and durable SQLite checkpointing.
The phase delivers:
- Domain Pydantic schemas for the 11-section project brief (`BriefSection`, `ProjectBrief`, `SectionKeyEnum`), user clarifications (`UserClarification`), and critique report (`CritiqueIssue`, `CritiqueReport`, `CritiqueIssueType`).
- 11-section project brief synthesis node (`synthesize_brief`) in LangGraph generating all 11 required sections grounded in confirmed facts, inferences, and user clarifications, plus a compiled unified markdown representation.
- Automated critique audit node (`critique_brief`) in LangGraph running an independent evaluation to flag ungrounded claims, contradiction neglect, missing constraints, or vague deliverables as advisory notes.
- Extended 6-node LangGraph pipeline (`extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications` -> `synthesize_brief` -> `critique_brief` -> END) with durable SQLite checkpointing (`SqliteSaver`).
- Hermetic unit and state recovery tests validating resumption across process restarts using persistent SQLite storage.

</domain>

<decisions>
## Implementation Decisions

### 11-Section Brief Structure & Section Modeling
- **D-01:** Strongly typed dictionary/model of 11 predefined sections with fixed keys: `executive_summary`, `objectives_success_criteria`, `target_audience`, `scope_of_work`, `out_of_scope`, `technical_architecture`, `assumptions_inferences`, `risks_contradictions`, `budget_commercials`, `timeline_milestones`, and `outstanding_questions`. Each section contains `title: str`, `content: str` (markdown), `source_fact_ids: list[str]`, `inference_ids: list[str]`, and `supporting_clarification_ids: list[str]`. — **Reversibility:** costly — consumed by Phase 5 API, Phase 6 diff logger, and Phase 10 frontend brief editor.
- **D-02:** Handling unaddressed sections: If a transcript contains zero information for a section (e.g. Budget or Timeline), the section explicitly outputs `"Not discussed in discovery call"` and embeds associated open questions/unknowns from extraction rather than fabricating ungrounded defaults or leaving the section empty. — **Reversibility:** reversible.
- **D-03:** Single synthesis prompt with structured output specifying all 11 sections at once via Groq (`llama-3.3-70b-versatile` with fallback to `llama-3.1-8b-instant`, `temperature=0.0`), maximizing inference speed and cross-section thematic coherence. — **Reversibility:** reversible.
- **D-04:** Dual output representation: The synthesis node generates both the granular structured section dictionary (`sections: dict[str, BriefSection]`) and a compiled unified markdown document (`full_markdown: str`) for instant preview and export. — **Reversibility:** reversible.

### Critique Audit Severity & Feedback Loop
- **D-05:** Advisory critique notes: Automated self-critique attaches structured audit notes (`critique_report: CritiqueReport`) to the brief for human inspection. It never silently alters or rewrites brief content, strictly maintaining human editorial authority. — **Reversibility:** costly — foundational core product value constraint.
- **D-06:** Audit dimensions: Critique node evaluates four specific issue types: `ungrounded_claim` (claim lacks anchoring quote/fact), `contradiction_neglect` (brief ignores an active transcript contradiction), `missing_constraint` (brief omitted a client restriction), and `vague_deliverable` (deliverable lacks measurable boundaries). — **Reversibility:** reversible.
- **D-07:** Structured `CritiqueReport`: Contains `score: int` (0-100 overall fidelity score), `summary: str`, and `issues: list[CritiqueIssue]`, each detailing `section_key: str`, `issue_type: str`, `severity: Literal["critical", "warning", "info"]`, `explanation: str`, and `suggested_fix: str`. — **Reversibility:** costly — consumed in Phase 5 API and Phase 10 UI.
- **D-08:** Independent critique execution: Evaluated via a dedicated structured LLM call on Groq comparing the candidate brief against confirmed facts, inferences, active contradictions, and transcript text. — **Reversibility:** reversible.

### Clarifications Integration Strategy
- **D-09:** `UserClarification` schema: Dedicated schema containing `question_id: str`, `resolved_text: str`, and `resolved_by: str = "user"`, tracked in `ExtractionState` as `user_clarifications: list[UserClarification]`. — **Reversibility:** costly — contract bridging Phase 3 questions, Phase 5 endpoints, and Phase 9 UI answers.
- **D-10:** Distinct prompt block: Clarifications injected into the synthesis prompt under a dedicated `'USER CLARIFICATIONS & RESOLUTIONS'` block, explicitly instructing the model to treat user answers as authoritative facts overriding transcript ambiguities. — **Reversibility:** reversible.
- **D-11:** Zero clarifications fallback: If synthesis runs with no user clarifications provided (`user_clarifications: []`), the pipeline proceeds smoothly, and unclarified gaps are surfaced in Section 11 (`outstanding_questions`) and Section 8 (`risks_contradictions`). — **Reversibility:** reversible.
- **D-12:** Clarification traceability: Each `BriefSection` explicitly tracks `supporting_clarification_ids: list[str]` to link section text to user answers. — **Reversibility:** reversible.

### Durable Checkpointing & State Storage
- **D-13:** Persistent SQLite storage: SqliteSaver persists state checkpoints in SQLite tables inside the main database or dedicated checkpoints store, ensuring state is durable across process restarts (DATA-04). — **Reversibility:** costly — infrastructure contract.
- **D-14:** Thread ID formatting: Use `thread_id = f"project:{project_id}:transcript:{transcript_id}"` (or `transcript_id`) ensuring independent, isolated state threads per analysis run. — **Reversibility:** reversible.
- **D-15:** Extended 6-node graph topology: LangGraph sequence expanded to 6 nodes: `extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications` -> `synthesize_brief` -> `critique_brief` -> `END`. — **Reversibility:** costly — core workflow structure.
- **D-16:** Resumption verification test: Hermetic integration tests simulate process termination and verify full state resumption from the SQLite checkpointer without state loss. — **Reversibility:** reversible.

### Agent's Discretion
- Exact prompt wording and section markdown template formatting within the 11 sections.
- Quality score weighting heuristics across critical/warning/info critique issues.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture & Requirements
- `.planning/PROJECT.md` — Core epistemic value proposition, grounding constraints, and human editorial authority.
- `.planning/REQUIREMENTS.md` §DATA-04, §BRIEF-01, §BRIEF-02 — Checkpointing, 11-section synthesis, and self-critique acceptance criteria.
- `.planning/ROADMAP.md` §Phase 4 — Goals, plans, and success criteria for Phase 4.

### Prior Phase Context & Code
- `.planning/phases/02-extraction-grounding-engine/02-CONTEXT.md` — Grounding rules and Groq model configurations.
- `.planning/phases/03-contradiction-detection-follow-up-questions/03-CONTEXT.md` — Contradiction and clarification question models.
- `backend/app/models/extraction.py` — ConfirmedFact, InferredPoint, UnknownGap, Contradiction, ClarificationQuestion schemas.
- `backend/app/graph/state.py` — ExtractionState TypedDict.
- `backend/app/graph/builder.py` — Existing LangGraph StateGraph builder.
- `backend/app/services/extraction.py` — Pipeline execution and SqliteSaver checkpointing helper.
- `backend/app/core/llm.py` — Groq LLM factory and fallback helpers.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/core/llm.py`: `get_extraction_llm_with_fallback()` handles structured outputs with automatic Groq model fallback.
- `backend/app/services/extraction.py`: `get_checkpointer()` provides `SqliteSaver` context management.
- `backend/app/graph/builder.py`: LangGraph builder modularly binds nodes and edges.

### Established Patterns
- Pydantic v2 schemas with strict typing, default values, and UUIDs.
- Structured LLM output parsing with Pydantic schemas via `.with_structured_output(...)`.
- Sequential LangGraph pipeline with state checkpointing on SQLite.

### Integration Points
- `backend/app/models/brief.py` (new): Define `BriefSection`, `ProjectBrief`, `UserClarification`, `CritiqueIssue`, `CritiqueReport`.
- `backend/app/graph/state.py`: Extend `ExtractionState` with `user_clarifications`, `draft_brief`, `critique_report`.
- `backend/app/graph/nodes/synthesize_brief.py` (new): Brief synthesis node.
- `backend/app/graph/nodes/critique_brief.py` (new): Critique audit node.
- `backend/app/graph/builder.py`: Append `synthesize_brief` and `critique_brief` nodes into the StateGraph.
- `tests/unit/test_brief_synthesis.py` (new): Test brief generation, 11 sections, and unaddressed section handling.
- `tests/unit/test_critique.py` (new): Test critique issue detection and report structure.
- `tests/integration/test_state_checkpointing.py` (new): Test SQLite checkpoint persistence and process recovery.

</code_context>

<specifics>
## Specific Ideas

- The 11 sections must read as a cohesive, professional agency-grade discovery brief, avoiding generic LLM filler text.
- If the transcript doesn't state a timeline or budget, clearly highlighting "Not discussed in discovery call" gives project managers immediate clarity on what needs client follow-up.
- Critique notes should be specific and constructive (e.g. "Section 4 mentions Stripe integration, but transcript only mentions PayPal; no source fact found").

</specifics>

<deferred>
## Deferred Ideas

- None — all decisions remain strictly within Phase 4 scope (DATA-04, BRIEF-01, BRIEF-02). REST API endpoints and human approval routes belong in Phase 5.

</deferred>

---

*Phase: 04-brief-synthesis-critique-durable-checkpointing*
*Context gathered: 2026-09-09*
