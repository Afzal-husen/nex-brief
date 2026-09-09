---
title: LangGraph Workflow Specification
date: 2026-09-09
context: Detailed state machine design for the discovery call to brief pipeline
---

# LangGraph Workflow Specification

## Overview
The LangGraph pipeline coordinates deterministic analysis nodes with human review gates to implement the user flow defined in `product_requirements.md`.

## State Definition (`BriefState`)
```python
class BriefState(TypedDict):
    project_id: str
    transcript_text: str
    # Story 3 & 4: Confirmed statements with verbatim citations
    confirmed_facts: list[ConfirmedFact]
    # Story 5: AI deductions labeled as assumptions
    inferred_points: list[InferredPoint]
    # Story 6: Unanswered critical questions / gaps
    unknowns: list[UnknownGap]
    # Story 8: Conflicting client statements
    contradictions: list[Contradiction]
    # Story 9: Prioritized questions for follow-up client calls
    follow_up_questions: list[FollowUpQuestion]
    # Human input / modifications applied before brief generation
    user_clarifications: dict[str, Any]
    # Story 10: Generated brief markdown/JSON
    draft_brief: dict[str, Any]
    # Story 11: Brief critique / potential assumptions check
    critique_notes: list[str]
    # Story 12 & 13: Final approved brief
    final_brief: dict[str, Any]
    # Story 14: Log of user corrections
    corrections_log: list[dict[str, Any]]
```

## Graph Nodes & Edges

```
[START]
   ↓
[extract_knowledge]          # Analyzes transcript into confirmed, inferred, and unknown
   ↓
[detect_contradictions]      # Flags internal conflicts or mismatched claims
   ↓
[generate_questions]         # Prioritizes high-impact follow-up questions
   ↓
[human_review_clarify]       <-- INTERRUPT (Human reviews, resolves gaps, clarifies)
   ↓
[synthesize_brief]           # Builds structured 11-section project brief
   ↓
[critique_brief]             # Audits brief for ungrounded claims or hallucinated scope
   ↓
[human_approve]              <-- INTERRUPT (User edits and gives final approval)
   ↓
[persist_and_log]            # Saves final brief and logs user corrections for evals (Story 14)
   ↓
[END]
```
