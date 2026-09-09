# Phase 2 Plan 02-02 Summary: Verbatim Grounding Verifier & LangGraph Pipeline

## Overview
Plan 02-02 implemented the deterministic truth-grounding verification engine, the two-node LangGraph extraction state machine (`extract_knowledge` -> `verify_grounding`) with durable `SqliteSaver` checkpointing, and the `run_extraction_pipeline()` service function. Every client-stated fact is verified as an exact literal substring of the normalized transcript, capturing full character and line coordinates while transparently segregating inferences, unknowns, and unverified claims.

## Key Changes
1. **Verbatim Grounding Verifier (`backend/app/services/grounding.py`):**
   - Built `calculate_line_numbers()` calculating 1-indexed `(line_start, line_end)` for character ranges.
   - Built `find_quote_spans()`:
     - Enforces D-10 by strictly forbidding ellipsis (`...` or `…`).
     - Strips quote decorations and speaker prefix labels before matching (D-09).
     - Gathers exact case-sensitive matches and case-insensitive matches across the transcript to capture all occurrences (D-08, D-13).
     - Falls back to whitespace-tolerant matching (D-06).
     - Returns chronologically sorted `list[QuoteSpan]`.
   - Built `re_prompt_failed_quote()` triggering targeted single re-prompt for candidate quotes failing initial verification (D-05).
   - Built `verify_candidate_facts()`:
     - Validates quotes against transcript text.
     - Deduplicates identical quotes into single facts consolidating occurrence spans (D-12).
     - Preserves rejected candidate facts in `unverified_candidates` with reasons (D-11).

2. **Two-Node LangGraph Extraction State Machine (`backend/app/graph/extraction.py`):**
   - Defined `ExtractionState(TypedDict)` carrying transcript IDs, normalized text, raw payload, confirmed facts, inferences, unknowns, and unverified candidates.
   - Formulated `EXTRACTION_SYSTEM_PROMPT` emphasizing verbatim quoting, epistemic boundary separation, and explicit deduction rationale.
   - Built `extract_knowledge` node calling Groq structured output client.
   - Built `verify_grounding` node verifying candidate quotes, mapping inference dependencies (`source_fact_ids`), and constructing `UnknownGap` items.
   - Added zero-fact safeguard generating a fallback `UnknownGap` if no verifiable requirements are found (D-15).
   - Built `build_extraction_graph()` compiling the pipeline with optional checkpointer support.

3. **Service Layer & Persistence (`backend/app/services/extraction.py`):**
   - Installed `langgraph-checkpoint-sqlite>=3.1.0` and updated `backend/pyproject.toml`.
   - Built `run_extraction_pipeline()` executing the compiled graph under `thread_id = transcript_id` with SQLite checkpointer persistence (D-23, D-26).
   - Automatically normalizes transcript text using `normalize_transcript_text()`.

4. **Automated Testing Suite:**
   - `backend/tests/test_grounding.py` (10 tests): verified exact substring match, case-insensitive fallback, whitespace fallback, ellipsis rejection, multiple occurrences, speaker label stripping, deduplication, unverified tracking, and targeted retry.
   - `backend/tests/test_extraction_graph.py` (3 tests): verified graph execution with mock Groq payload, inference linkage, checkpointer persistence, zero-fact fallback, and service layer invocation.
   - `backend/tests/test_live_extraction.py` (1 test): live integration test hitting Groq API conditionally when `GROQ_API_KEY` is present.

## Verification
- Ran `pytest backend/tests/test_grounding.py backend/tests/test_extraction_graph.py backend/tests/test_live_extraction.py`: 13 passed, 1 skipped.
- Ran full backend test suite: 33 passed, 1 skipped (0 failures).
