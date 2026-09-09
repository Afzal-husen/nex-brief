# Plan 03-01 Summary: Contradiction Detection Node with Verbatim Grounding

**Executed:** 2026-09-09
**Status:** Complete
**Requirements:** EXTRACT-05

## Deliverables
1. **Contradiction Data Models (`backend/app/models/extraction.py`, `backend/app/models/__init__.py`)**:
   - `Contradiction`: Pairs two conflicting statements (`claim_a`, `claim_b`), their verbatim transcript quotes (`quote_a`, `quote_b` with `QuoteSpan`s), optional matched `fact_id_a` / `fact_id_b`, `conflict_rationale`, `severity` ("direct_conflict" | "tension"), and `category`.
   - `RawContradictionCandidate`, `RawContradictionPayload`: Structured schemas for Groq LLM extraction.
   - `UnverifiedContradiction`: Diagnostic record preserving rejected candidates with error reason.
2. **LLM Structured Client (`backend/app/core/llm.py`)**:
   - `get_structured_contradiction_client()` wrapping Groq fallback chain with `RawContradictionPayload`.
   - Hermetic test mock helpers `set_mock_contradiction_client()` and `clear_mock_contradiction_client()`.
3. **Contradiction Detection Node (`backend/app/graph/contradiction.py`)**:
   - `detect_contradictions_node(state)`: Prompts Groq with transcript and confirmed facts context, runs deterministic `find_quote_spans` on both `quote_a` and `quote_b`, strictly prohibits ellipsis (`...`), links matching `ConfirmedFact` IDs, and populates `contradictions` and `unverified_contradictions`.
4. **Unit Tests (`backend/tests/test_schemas.py`, `backend/tests/test_contradiction.py`)**:
   - 13 passing unit tests validating schema creation, quote span verification, ellipsis rejection, missing quote handling, and empty contradiction edge cases.
