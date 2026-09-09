# Phase 3: Contradiction Detection & Follow-up Questions - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Add contradiction detection (`EXTRACT-05`) and prioritized follow-up question generation (`CLARIFY-01`) to the LangGraph state machine. The phase delivers:
- Domain Pydantic schemas for `Contradiction` (paired claims, verbatim quotes, spans, conflict rationale, severity) and `ClarificationQuestion` (priority, target reference, rationale, suggested options).
- Contradiction detection node (`detect_contradictions`) in LangGraph identifying conflicting statements and programmatically verifying verbatim quotes for both sides using `find_quote_spans`.
- Follow-up question generator node (`generate_clarifications`) in LangGraph ranking top 3-5 questions based on severity and scoping impact heuristics.
- Pipeline integration into a sequential 4-node LangGraph workflow (`extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications`) with durable SQLite checkpointing.
- Comprehensive hermetic unit test suite with mocked LLM fixtures and live Groq integration tests.

</domain>

<decisions>
## Implementation Decisions

### Contradiction Data Model & Grounding
- **D-01:** Hybrid quote-anchored contradiction schema (`Contradiction`): Each contradiction pairs two distinct conflicting statements (`claim_a`, `claim_b`), their verbatim quotes (`quote_a`, `quote_b` with structured `spans: list[QuoteSpan]`), linking to source `ConfirmedFact` IDs if applicable (`fact_id_a`, `fact_id_b`), along with `conflict_rationale`, `severity` ("direct_conflict" vs "tension"), and `category: FactCategory`. — **Reversibility:** costly — core contract consumed by Phase 5 REST endpoints and Phase 9 UI review cards.
- **D-02:** Programmatic verbatim quote grounding for both sides of contradictions: quotes must be non-empty literal substrings of `normalized_text`, enforcing the same strict zero-ellipsis rule (`...` prohibited) as Phase 2. — **Reversibility:** costly — foundational epistemic integrity rule.
- **D-03:** Candidate contradictions whose quotes fail verbatim verification are preserved in graph state under `unverified_contradictions: list[UnverifiedContradiction]` with failure reason for debugging and audit transparency. — **Reversibility:** reversible.
- **D-04:** Zero contradictions behavior: If no contradictions are detected in the transcript, `contradictions` list is empty `[]`, and the pipeline completes cleanly without warnings or errors. — **Reversibility:** reversible.

### LangGraph State Machine Integration & Node Topology
- **D-05:** Sequential 4-node pipeline: `extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications`. Ensures clean separation of concerns, enables contradictions to directly inform clarification questions, and allows independent unit testing of each node. — **Reversibility:** costly — defines core LangGraph workflow topology.
- **D-06:** Node 3 (`detect_contradictions`) leverages Groq (`llama-3.3-70b-versatile` with `llama-3.1-8b-instant` fallback) with structured output binding for candidate contradictions, followed immediately by programmatic substring grounding using `find_quote_spans`. — **Reversibility:** reversible.
- **D-07:** `ExtractionState` is extended to track `contradictions: list[Contradiction]`, `unverified_contradictions: list[UnverifiedContradiction]`, and `clarification_questions: list[ClarificationQuestion]`, persisted atomically across steps via `SqliteSaver`. — **Reversibility:** costly — state schema contract.

### Question Ranking & Prioritization Strategy (CLARIFY-01)
- **D-08:** Severity & Scoping Impact Heuristic: Direct conflict contradictions (`severity="direct_conflict"`) are prioritized first as highest delivery risk, followed by High-impact `UnknownGap`s (budget, timeline, core technical constraints), followed by medium-impact unknowns or subtle tensions. — **Reversibility:** reversible.
- **D-09:** Strict 3-5 question cap: System outputs at most 5 prioritized questions and targets at least 3 questions (unless the transcript has fewer than 3 total gaps and conflicts, in which case available items are returned without artificial hallucinated padding). — **Reversibility:** reversible.
- **D-10:** `ClarificationQuestion` schema includes `id: str`, `priority: int` (1 to 5), `target_type: Literal["contradiction", "unknown_gap"]`, `target_id: str`, `question: str`, `rationale: str` (why this decision blocks scoping), and optional `suggested_options: list[str]` to help clients answer quickly. — **Reversibility:** costly — schema consumed in Phase 5 API and Phase 9 UI.

### Folded Todos
- None folded in Phase 3.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture & Requirements
- `.planning/PROJECT.md` — Core epistemic value proposition, grounding constraints, and human editorial authority.
- `.planning/REQUIREMENTS.md` §EXTRACT-05, §CLARIFY-01 — Contradiction detection and follow-up question acceptance criteria.
- `.planning/ROADMAP.md` §Phase 3 — Phase 3 goals, plans, and success criteria.

### Prior Phase Context & Code
- `.planning/phases/02-extraction-grounding-engine/02-CONTEXT.md` — Phase 2 decisions on verbatim grounding, quote spans, models, and checkpointer.
- `backend/app/models/extraction.py` — Existing epistemic domain models (`ConfirmedFact`, `QuoteSpan`, `FactCategory`, `UnknownGap`, `ExtractionResult`).
- `backend/app/services/grounding.py` — Deterministic verbatim substring verifier (`find_quote_spans`).
- `backend/app/graph/extraction.py` — Existing two-node LangGraph extraction pipeline.
- `backend/app/services/extraction.py` — High-level extraction pipeline service runner.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/services/grounding.py`: `find_quote_spans()` can be reused directly to verify and locate both `quote_a` and `quote_b` in candidate contradictions.
- `backend/app/core/llm.py`: `get_extraction_llm_with_fallback()` and `get_groq_llm()` provide structured output extraction with Groq fallback.
- `backend/app/models/extraction.py`: `FactCategory` and `QuoteSpan` can be directly embedded into `Contradiction`.
- `backend/app/graph/extraction.py`: `ExtractionState` and `build_extraction_graph()` provide the skeleton to add the two new nodes.

### Established Patterns
- Pydantic v2 schemas with UUID4 string IDs and descriptive field metadata.
- Structured LLM output parsing with `with_structured_output(...)`.
- Deterministic quote substring verification with case-insensitivity and whitespace fallback.
- SQLite checkpointer integration (`SqliteSaver`) with thread-based session isolation.

### Integration Points
- `backend/app/models/extraction.py`: Define `Contradiction`, `RawContradictionCandidate`, `UnverifiedContradiction`, `ClarificationQuestion`, `RawQuestionCandidate`.
- `backend/app/graph/extraction.py`: Add `detect_contradictions` and `generate_clarifications` nodes to `StateGraph`.
- `backend/app/services/extraction.py`: Return full results including contradictions and questions in `ExtractionResult`.

</code_context>

<specifics>
## Specific Ideas

- Contradictions must never be speculative: each side must be anchored to a literal quote from the transcript so the user can verify the conflict at a glance.
- If a client says "our budget is $50k" in section 1 and "we cannot spend more than $30k" in section 4, both quotes are captured with line numbers and character offsets, with severity marked as `direct_conflict`.
- Question prioritization ensures users are not overwhelmed with dozens of trivial questions, focusing human attention on the 3-5 critical blockers.

</specifics>

<deferred>
## Deferred Ideas

- None — all decisions remain strictly within Phase 3 scope (`EXTRACT-05` and `CLARIFY-01`). Human-in-the-loop interruption gate is scheduled for Phase 4 & 5.

</deferred>

---

*Phase: 3-Contradiction Detection & Follow-up Questions*
*Context gathered: 2026-09-09*
