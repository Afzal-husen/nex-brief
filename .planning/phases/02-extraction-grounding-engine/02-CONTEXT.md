# Phase 2: Extraction & Grounding Engine - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the LangGraph knowledge extraction node powered by Groq and enforce strict programmatic verbatim quote anchoring. The phase delivers:
- Groq client integration via `langchain-groq` targeting `llama-3.3-70b-versatile` with fallback to `llama-3.1-8b-instant`.
- Epistemic Pydantic schemas: `ConfirmedFact`, `InferredPoint`, `UnknownGap`, `UnverifiedCandidate`, and `ExtractionResult`.
- Verbatim quote substring verification ensuring every `source_quote` exists as an unbroken literal substring of the normalized transcript text.
- Two-node LangGraph pipeline (`extract_knowledge` -> `verify_grounding`) with internal targeted retry for quote mismatches.
- Durable LangGraph state persistence via `SqliteSaver`.
- Service interface `run_extraction_pipeline` in `app/services/extraction.py`.
- Comprehensive test suite with mocked LLM fixtures and optional live Groq integration tests.

</domain>

<decisions>
## Implementation Decisions

### Groq Model Selection & LLM Parameters
- **D-01:** Primary extraction model is `llama-3.3-70b-versatile` with automatic fallback to `llama-3.1-8b-instant` if 429 rate limits or transient errors occur. — **Reversibility:** costly — impacts prompt formatting and token limits across LLM wrappers.
- **D-02:** Generation temperature is set to `0.0` (deterministic) across all extraction tasks to maximize JSON schema compliance and prevent creative paraphrasing of quotes. — **Reversibility:** reversible.
- **D-03:** Testing strategy uses mock fixtures with canned structured outputs for hermetic offline unit tests; live Groq tests run conditionally only when `GROQ_API_KEY` is present. — **Reversibility:** reversible.
- **D-04:** 30s timeout on Groq API requests with exponential backoff retry (up to 3 retries for 429/503 errors) before falling back to 8b. — **Reversibility:** reversible.

### Verbatim Quote Verification & Hallucination Recovery
- **D-05:** If a candidate quote fails exact substring verification, the verifier triggers a single targeted re-prompt for failed quotes; if the quote still cannot be verified, the ungrounded fact is dropped. — **Reversibility:** costly — defines error recovery and grounding guarantees.
- **D-06:** Substring verification matches against `normalized_text` first; if minor whitespace discrepancies occur, it falls back to whitespace-collapsed matching against `normalized_text`. — **Reversibility:** reversible.
- **D-07:** No quote length limits: accept any verbatim substring regardless of length as long as it exists in the transcript text. — **Reversibility:** reversible.
- **D-08:** If a quote appears multiple times in the transcript, record all occurrence span coordinates as a list `[(start, end), ...]`. — **Reversibility:** costly — core schema contract consumed by UI-03 highlighting.
- **D-09:** Speaker labels (e.g., `Client:`, `Sarah:`) must be excluded from the quote text; speaker attribution is stored in a dedicated `speaker` field. — **Reversibility:** reversible.
- **D-10:** Strictly forbid ellipsis (`...`) in `source_quote` — quotes must be 100% contiguous literal substrings. — **Reversibility:** costly — epistemic integrity pillar.
- **D-11:** Candidate facts that fail retry verification are preserved in graph state under `unverified_candidates: list[UnverifiedCandidate]` with error reason for full debugging and auditability. — **Reversibility:** reversible.
- **D-12:** Facts with identical source quotes are deduplicated and merged into a single `ConfirmedFact` containing all occurrence spans. — **Reversibility:** reversible.
- **D-13:** Substring matching uses case-sensitive exact match first; if not found, it falls back to case-insensitive matching anchoring to the transcript's actual casing. — **Reversibility:** reversible.
- **D-14:** Allow sub-phrases of sentences as valid quotes as long as the sub-phrase is a contiguous literal substring. — **Reversibility:** reversible.
- **D-15:** If 0 confirmed facts pass verification, complete cleanly without throwing an unhandled exception and emit an `UnknownGap` ("Transcript contained no verifiable project requirements"). — **Reversibility:** reversible.

### Epistemic Data Schemas & UI Grounding Metadata
- **D-16:** Standardized Category Enum (`scope`, `timeline`, `budget`, `tech_stack`, `target_audience`, `constraints`, `integrations`, `other`) for facts, inferences, and gaps. — **Reversibility:** costly — shared across extraction, brief synthesis, and UI filters.
- **D-17:** `InferredPoint` schema links to supporting facts via `source_fact_ids: list[str]` + `rationale: str` for transparent epistemic provenance. — **Reversibility:** costly — links deductions to evidence.
- **D-18:** `UnknownGap` schema includes `impact_level: "high" | "medium" | "low"`, `missing_information: str`, and `suggested_question: str` to directly feed Phase 3 follow-up question generation. — **Reversibility:** reversible.
- **D-19:** `ConfirmedFact` coordinates formatted as `spans: list[QuoteSpan]` with `start_char`, `end_char`, `line_start`, and `line_end`. — **Reversibility:** costly — frontend transcript viewer contract.

### LangGraph State & Node Pipeline Design
- **D-20:** Two-node pipeline: `extract_knowledge` -> `verify_grounding` (clean separation of LLM generation from deterministic verification). — **Reversibility:** costly — core LangGraph topology.
- **D-21:** State represented as a `TypedDict` (`ExtractionState`) containing nested Pydantic models for facts, inferences, unknowns, and unverified candidates. — **Reversibility:** reversible.
- **D-22:** Linear graph execution flow: the single targeted retry for failed quotes is executed internally within the `verify_grounding` node rather than creating a cyclical graph edge. — **Reversibility:** reversible.
- **D-23:** Compiled graph returns full typed `ExtractionResult` and integrates with `SqliteSaver` checkpointer using `settings.database_url` and `thread_id = transcript_id`. — **Reversibility:** costly — state persistence mechanism.
- **D-24:** Single unified extraction LLM call with `with_structured_output(ExtractionResult)` capturing facts, inferences, and gaps in one cohesive pass. — **Reversibility:** reversible.
- **D-25:** Single-pass processing for transcripts up to 60k tokens (~45k words). — **Reversibility:** reversible.
- **D-26:** Expose pipeline via service function `run_extraction_pipeline(transcript_id, transcript_text)` in `app/services/extraction.py`. — **Reversibility:** reversible.

### Folded Todos
- **Setup FastAPI, LangGraph, and Groq in Backend**: LangGraph state machine setup and Groq LLM integration folded into Phase 2 as the core extraction engine.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture & Grounding
- `.planning/PROJECT.md` — Core epistemic value proposition and grounding constraints.
- `.planning/REQUIREMENTS.md` §EXTRACT-01..EXTRACT-04 — Extraction and quote verification acceptance criteria.
- `.planning/ROADMAP.md` §Phase 2 — Success criteria and plan definitions.

### Existing Backend Infrastructure
- `backend/app/models/transcript.py` — Raw and normalized transcript storage model.
- `backend/app/services/transcript.py` — `normalize_transcript_text()` implementation and text transformations.
- `backend/app/core/config.py` — Application configuration and environment variable loading.
- `backend/app/core/database.py` — Database engine and connection pooling.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/services/transcript.py`: `normalize_transcript_text()` can be used to ensure candidate quotes and transcript text are evaluated under consistent Unicode NFKC normalization.
- `backend/app/core/config.py`: `settings.groq_api_key` and `settings.database_url` ready for LLM client and checkpointer initialization.
- `backend/tests/conftest.py`: In-memory SQLite fixtures and test client conventions.

### Established Patterns
- Pydantic models with strict typing and UUID4 string identifiers.
- SQLModel database persistence in WAL mode.
- Pytest test suite with isolated databases and clean fixtures.

### Integration Points
- `backend/app/services/extraction.py`: New service wrapping LangGraph extraction execution.
- `backend/app/graph/`: New package housing LangGraph state schemas, extraction node, verification logic, and graph builder.
- `backend/app/models/extraction.py`: Pydantic domain models for facts, inferences, unknowns, and quote spans.

</code_context>

<specifics>
## Specific Ideas

- Verbatim quote integrity is non-negotiable: hallucinated quotes or cherry-picked ellipsis are strictly prohibited.
- Single targeted re-prompt allows the LLM to recover from minor quotation hallucinations before ungrounded facts are dropped.
- Character spans `(start_char, end_char, line_start, line_end)` directly prepare the data for the Next.js transcript viewer in UI-03.

</specifics>

<deferred>
## Deferred Ideas

- None — all discussed decisions strictly align with Phase 2 scope. Contradiction detection remains deferred to Phase 3 (EXTRACT-05).

</deferred>

---

*Phase: 2-Extraction & Grounding Engine*
*Context gathered: 2026-09-09*
