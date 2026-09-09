# Phase 3: Contradiction Detection & Follow-up Questions - Research

**Researched:** 2026-09-09
**Domain:** LangGraph State Machine, Contradiction Detection, Epistemic Grounding, Heuristic Prioritization
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 (Contradiction Model):** Hybrid quote-anchored schema `Contradiction`: pairs two statements (`claim_a`, `claim_b`), their verbatim quotes (`quote_a`, `quote_b` with `QuoteSpan`s), optional links to source `ConfirmedFact` IDs (`fact_id_a`, `fact_id_b`), `conflict_rationale`, `severity` (`"direct_conflict"` | `"tension"`), and `category: FactCategory`.
- **D-02 (Verbatim Grounding for Both Sides):** Programmatic verification via `find_quote_spans` for both `quote_a` and `quote_b` against `normalized_text`. Strict zero-ellipsis rule (`...` forbidden).
- **D-03 (Unverified Retention):** Candidates failing quote verification are preserved in `unverified_contradictions: list[UnverifiedContradiction]` with failure reason.
- **D-04 (Zero Contradictions Behavior):** If no contradictions exist, `contradictions` list is empty `[]`, and graph continues smoothly.
- **D-05 (Pipeline Topology):** Sequential 4-node pipeline: `extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications`.
- **D-06 (Detection Node LLM):** Groq `llama-3.3-70b-versatile` with `llama-3.1-8b-instant` fallback, temperature=0.0, structured output binding for `RawContradictionCandidate`s.
- **D-07 (State Extension):** `ExtractionState` tracks `contradictions`, `unverified_contradictions`, and `clarification_questions`, persisted across nodes via `SqliteSaver`.
- **D-08 (Prioritization Heuristic):** Severity & Scoping Impact Heuristic: Unresolved `direct_conflict` contradictions ranked highest priority, followed by High-impact `UnknownGap`s (budget/timeline/core scope), followed by medium-impact unknowns or subtle tensions.
- **D-09 (Question Cap):** Top 3-5 prioritized follow-up questions (`CLARIFY-01`).
- **D-10 (Question Schema):** `ClarificationQuestion` with `id: str`, `priority: int` (1-5), `target_type: Literal["contradiction", "unknown_gap"]`, `target_id: str`, `question: str`, `rationale: str`, and optional `suggested_options: list[str]`.

### Deferred Ideas (OUT OF SCOPE)
- Interactive human-in-the-loop interruption pause (`CLARIFY-02`, Phase 5).
- REST API clarification submission endpoints (`CLARIFY-03`, Phase 5).
- Frontend clarification resolution interface (`UI-04`, Phase 9).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Domain Models | `backend/app/models/extraction.py` | API schemas | Defines `Contradiction`, `ClarificationQuestion`, and raw structured extraction payloads |
| Contradiction Detection Node | `backend/app/graph/contradiction.py` | `backend/app/graph/extraction.py` | LLM invocation + deterministic quote verification for paired claims |
| Follow-up Question Prioritization | `backend/app/graph/clarification.py` | `backend/app/graph/extraction.py` | Algorithmic and LLM-assisted ranking of high-impact blockers into 3-5 questions |
| LangGraph State Machine Assembly | `backend/app/graph/extraction.py` | LangGraph Runtime | Extends graph to 4-node sequential workflow with SQLite checkpointer |
| Pipeline Service Interface | `backend/app/services/extraction.py` | FastAPI Dependencies | Dispatches graph execution and returns full aggregated `ExtractionResult` |

</architectural_responsibility_map>

<research_findings>
## Technical Analysis & Patterns

### 1. Contradiction Detection via Groq Structured Outputs
To detect contradictions accurately without hallucinations:
- The LLM receives the `normalized_text` transcript along with the list of already extracted `ConfirmedFact`s.
- Structured output target: `RawContradictionPayload` containing `candidates: list[RawContradictionCandidate]`.
- Each candidate has `claim_a`, `quote_a`, `claim_b`, `quote_b`, `conflict_rationale`, `severity` (`"direct_conflict"` or `"tension"`), and `category`.
- Node runs `find_quote_spans()` on both `quote_a` and `quote_b`. If either quote fails exact substring verification, the candidate is placed into `unverified_contradictions`. If both pass, it resolves into a valid `Contradiction` with spans populated.
- If a candidate's quote matches an existing `ConfirmedFact`, `fact_id_a` or `fact_id_b` is linked.

### 2. Follow-up Question Ranking Heuristic (CLARIFY-01)
`CLARIFY-01` requires top 3-5 prioritized follow-up questions targeting unknowns and conflicts.
- **Priority Tier 1 (Rank 1 - 2):** `Contradiction`s with `severity == "direct_conflict"`. These represent direct client discrepancies that risk invalidating requirements.
- **Priority Tier 2 (Rank 2 - 4):** `UnknownGap`s with `impact_level == "high"` (budget, delivery timeline, core deliverables).
- **Priority Tier 3 (Rank 3 - 5):** `Contradiction`s with `severity == "tension"` and `UnknownGap`s with `impact_level == "medium"`.
- We select the top items across tiers, capped strictly at 5 (minimum 3 if at least 3 gaps/conflicts exist).
- For each selected item, an LLM call (or rule-based generator with LLM refinement) crafts a concise, professional follow-up question with `rationale` and concrete `suggested_options` (e.g. `["Option A", "Option B", "Alternative"]`).

### 3. LangGraph 4-Node Pipeline Flow
Current:
`extract_knowledge` -> `verify_grounding` -> END

Updated:
`extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications` -> END

- `ExtractionState` TypedDict extended:
  ```python
  class ExtractionState(TypedDict):
      transcript_id: str
      transcript_text: str
      normalized_text: str
      raw_payload: RawExtractionPayload | None
      facts: list[ConfirmedFact]
      inferences: list[InferredPoint]
      unknown_gaps: list[UnknownGap]
      unverified_candidates: list[UnverifiedCandidate]
      contradictions: list[Contradiction]
      unverified_contradictions: list[UnverifiedContradiction]
      clarification_questions: list[ClarificationQuestion]
  ```
- All nodes update state additively and cleanly.

</research_findings>
