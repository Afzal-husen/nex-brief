# Phase 2 Plan 02-01 Summary: Epistemic Schemas & Groq LLM Client

## Overview
Plan 02-01 established the core epistemic domain models and Groq LLM client infrastructure for NexBrief. It defines typed Pydantic models separating confirmed facts from deductions and information gaps, supports verbatim quote span coordinates, and wraps `langchain-groq` with deterministic sampling and model fallback.

## Key Changes
1. **Epistemic Domain Schemas (`backend/app/models/extraction.py`):**
   - `FactCategory`: Standardized enum (`scope`, `timeline`, `budget`, `tech_stack`, `target_audience`, `constraints`, `integrations`, `other`).
   - `QuoteSpan`: Structured coordinate span with `start_char`, `end_char`, `line_start`, and `line_end`.
   - `ConfirmedFact`: Represents client-stated facts with default UUID4 identifiers, category, statement, exact `source_quote`, optional `speaker`, and `spans: list[QuoteSpan]`.
   - `InferredPoint`: Represents deduced statements explicitly linked back to evidence via `source_fact_ids: list[str]` and a descriptive `rationale`.
   - `UnknownGap`: Scoping gap representation with `missing_information`, `impact_level` ("high", "medium", "low"), and a `suggested_question` for clarification.
   - `UnverifiedCandidate`: Audit representation for candidate facts whose quotes fail verification.
   - `RawFactCandidate`, `RawInferenceCandidate`, `RawUnknownCandidate`, and `RawExtractionPayload`: Intermediate extraction schemas bound to Groq structured output.
   - `ExtractionResult`: High-level container aggregating confirmed facts, inferences, unknowns, and unverified candidates.
   - Re-exported all models cleanly in `backend/app/models/__init__.py`.

2. **Groq LLM Client & Fallback (`backend/app/core/llm.py`):**
   - Built `get_groq_llm()` configuring `ChatGroq` with 30s timeout and 3 retries.
   - Built `get_extraction_llm_with_fallback()` linking primary `llama-3.3-70b-versatile` with automatic fallback to `llama-3.1-8b-instant` on rate limits.
   - Built `get_structured_extraction_client()` returning `with_structured_output(RawExtractionPayload)`.
   - Added mock client injection helpers (`set_mock_extraction_client`, `clear_mock_extraction_client`) for offline hermetic testing.
   - Added property aliases (`groq_api_key`, `database_url`) to `Settings` in `backend/app/core/config.py`.

3. **Automated Testing Suite:**
   - Built `backend/tests/test_schemas.py` testing category enums, span coordinates, UUID defaults, inference linkage, and raw extraction payloads (7 tests).
   - Built `backend/tests/test_llm.py` testing Groq client parameters, fallback chain configuration, and mock client overrides (3 tests).

## Verification
- Ran `pytest backend/tests/test_schemas.py backend/tests/test_llm.py`: 10/10 passed.
- Ran full test suite across backend: 20/20 passed without regressions.
