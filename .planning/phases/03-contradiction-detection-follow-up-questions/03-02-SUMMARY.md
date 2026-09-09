# Plan 03-02 Summary: Prioritized Question Generator Node & 4-Node Pipeline Integration

**Executed:** 2026-09-09
**Status:** Complete
**Requirements:** CLARIFY-01, EXTRACT-05

## Deliverables
1. **Clarification Question Schemas (`backend/app/models/extraction.py`, `backend/app/models/__init__.py`)**:
   - `ClarificationQuestion`: Encapsulates priority (1-5), `target_type` ("contradiction" | "unknown_gap"), `target_id`, `question`, `rationale`, and optional `suggested_options: list[str]`.
   - `RawQuestionCandidate`, `RawClarificationPayload`: Structured output schemas for Groq LLM synthesis.
2. **Prioritized Question Generator Node (`backend/app/graph/clarification.py`)**:
   - `generate_clarifications_node(state)`: Implements Severity & Scoping Impact Heuristic (D-08) prioritizing direct conflict contradictions first, high-impact unknowns second, tensions third, and medium unknowns fourth.
   - Strictly enforces the 3-5 question cap (D-09) and includes graceful deterministic fallback when LLM is unavailable.
3. **Sequential 4-Node LangGraph State Machine (`backend/app/graph/extraction.py`)**:
   - Assembles pipeline: `extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications` -> `END`.
   - `ExtractionState` tracks `contradictions`, `unverified_contradictions`, and `clarification_questions`.
4. **Service Runner Update (`backend/app/services/extraction.py`)**:
   - `run_extraction_pipeline()` persists state with `SqliteSaver` checkpointer and returns full typed `ExtractionResult`.
5. **Unit & Integration Tests (`backend/tests/test_clarification.py`, `backend/tests/test_extraction_graph.py`)**:
   - 8 tests passing verifying heuristic ranking, question capping at 5, empty states, and full 4-node pipeline execution.
