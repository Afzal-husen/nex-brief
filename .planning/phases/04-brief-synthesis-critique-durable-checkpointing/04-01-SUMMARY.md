# Plan 04-01 Summary: Brief Synthesis & Critique Nodes

## Overview
Implemented the domain Pydantic schemas for the 11-section project brief, user clarifications, and critique reports, along with the LangGraph `synthesize_brief` and `critique_brief` nodes.

## Key Changes
1. **Domain Models (`backend/app/models/brief.py`):**
   - `SectionKeyEnum` and `SECTION_TITLES` covering all 11 required brief sections.
   - `BriefSection` tracking `key`, `title`, `content`, `source_fact_ids`, `inference_ids`, and `supporting_clarification_ids`.
   - `ProjectBrief` holding the full section map and compiled `full_markdown`.
   - `UserClarification` for user answers and resolved contradictions.
   - `CritiqueIssue`, `CritiqueReport`, and `CritiqueIssueType` checking `ungrounded_claim`, `contradiction_neglect`, `missing_constraint`, and `vague_deliverable`.
2. **State Extension (`backend/app/graph/state.py`):**
   - Added `user_clarifications: list[UserClarification]`, `draft_brief: ProjectBrief | None`, and `critique_report: CritiqueReport | None` to `ExtractionState`.
3. **Synthesis Node (`backend/app/graph/nodes/synthesize_brief.py`):**
   - Formats structured facts, inferences, contradictions, and user clarifications into Groq prompt blocks.
   - Strictly enforces that unaddressed sections (e.g. Budget or Timeline without transcript facts) output `"Not discussed in discovery call"` with linked unknowns.
   - Compiles unified full markdown with title and section headers.
4. **Critique Node (`backend/app/graph/nodes/critique_brief.py`):**
   - Audits draft brief against input facts, active contradictions, and user clarifications.
   - Flags issues and calculates a quality score (0-100) with deductions for critical (-20) and warning (-10) issues.
5. **Testing & Verification:**
   - 8 new unit tests in `test_brief_models.py`, `test_brief_synthesis.py`, and `test_critique.py`.
   - All 52 unit and integration tests passing.
