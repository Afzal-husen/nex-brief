# Phase 3: Contradiction Detection & Follow-up Questions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 3-Contradiction Detection & Follow-up Questions
**Areas discussed:** Contradiction Data Model & Grounding, Graph Integration & Node Placement, Question Ranking & Prioritization Strategy

---

## Contradiction Data Model & Grounding

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid quote-anchored contradiction | Each contradiction pairs two distinct statements with verified verbatim quotes (and QuoteSpans), linking to source ConfirmedFacts if they exist, plus conflict_rationale and severity (direct_conflict vs tension). | ✓ |
| Strict ConfirmedFact-only pairs | Contradictions can only reference existing ConfirmedFact IDs (fact_id_a, fact_id_b) already identified during fact extraction, with an explanation of why they conflict. | |
| Unanchored conceptual clashes | Contradiction model only holds claim descriptions and conflict explanation without requiring verbatim quote coordinates for both sides. | |

**User's choice:** Hybrid quote-anchored contradiction
**Notes:** Anchoring both sides with exact verbatim quotes maintains epistemic integrity. Quote coordinates (`QuoteSpan`s) will allow the frontend to highlight both clashing quotes simultaneously.

---

## Graph Integration & Node Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential 4-node pipeline | extract_knowledge -> verify_grounding -> detect_contradictions -> generate_clarifications (clean separation, contradictions feed into question generation, each node testable independently). | ✓ |
| Consolidated analysis node | extract_knowledge -> verify_grounding -> analyze_tensions_and_questions (combines contradiction detection and question generation in one LLM call to reduce latency). | |
| Parallel branching | verify_grounding runs detect_contradictions and generate_clarifications in parallel, merging results in a join node. | |

**User's choice:** Sequential 4-node pipeline
**Notes:** Contradictions are critical context for follow-up questions (unresolved contradictions are top priority questions). The sequential arrangement guarantees contradictions are detected and verified before question generation runs.

---

## Question Ranking & Prioritization Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Severity & Scoping Impact Heuristic | Direct contradictions prioritized first, followed by High-impact unknowns (budget/timeline/core scope). Each question includes target reference, rationale, and optional suggested options (capped strictly at 3-5 questions). | ✓ |
| LLM Holistic Impact Scoring | Provide all gaps and contradictions to the LLM to rate each on a 1-10 architectural impact scale, returning the top 3-5 highest scoring questions. | |
| Category-Balanced Allocation | Ensure top questions span distinct categories (at most one per category: scope, timeline, budget, technical) rather than focusing only on highest-risk items. | |

**User's choice:** Severity & Scoping Impact Heuristic
**Notes:** Direct contradictions pose the biggest risk to project estimation and execution, followed by hard scoping voids (budget/timeline). Capping at 3-5 prevents fatigue and prepares the exact payload needed for the Phase 9 clarification UI.

---

## the agent's Discretion

None — all decisions were explicitly aligned with the user.

## Deferred Ideas

None — discussion remained strictly scoped to Phase 3 requirements (`EXTRACT-05`, `CLARIFY-01`).
