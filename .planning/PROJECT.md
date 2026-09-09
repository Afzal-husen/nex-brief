# NexBrief

## What This Is

NexBrief is an AI-powered assistant that transforms client discovery-call transcripts into clear, structured, and trustworthy project briefs. Instead of merely summarizing conversations, NexBrief serves as an epistemic partner that clearly separates what the client explicitly stated from what the AI inferred, identifies contradictions and missing information, suggests follow-up questions, and synthesizes a comprehensive brief with human approval at every step.

## Core Value

Turn unstructured discovery transcripts into verifiable, grounded project briefs where every fact is anchored to client statements, inferences are transparently labeled, and the user retains complete editorial authority.

## Requirements

### Validated

- ✓ Next.js 16 frontend scaffold with React 19 and Tailwind CSS v4 — existing
- ✓ Python backend scaffold with pyproject.toml — existing

### Active

- [ ] FastAPI backend service with health and project endpoints
- [ ] SQLModel / SQLite persistence for projects, transcripts, analysis state, briefs, and corrections
- [ ] Pre-transcribed text ingestion (paste / file upload)
- [ ] LangGraph extraction pipeline (confirmed facts with verbatim citations, inferences, unknowns, contradictions)
- [ ] Groq LLM integration (Llama 3.3 70B) for low-latency reasoning
- [ ] Prioritized follow-up question generation for missing gaps
- [ ] Human-in-the-loop review and clarification interruption gate
- [ ] 11-section project brief synthesis with self-critique check
- [ ] Human edit and final approval flow
- [ ] User corrections logging for future evaluation datasets (Story 14)
- [ ] Next.js UI integration with transcript quote highlighting and brief editor

### Out of Scope

- Audio / speech-to-text recording or live transcription — deferred post-MVP to minimize latency and dependency complexity; users paste or upload pre-transcribed text
- Multi-user authentication & team permissions — single-operator workflow for MVP
- Direct CRM / Project Management tool integrations (Jira, Linear, Notion) — export as structured Markdown/JSON for v1

## Context

- Discovery calls contain rich client context that often gets distorted in standard LLM summarization.
- NexBrief acts as an epistemic partner: it explicitly separates verbatim confirmed statements from AI deductions, highlights unresolved ambiguities, and prioritizes questions before synthesizing an 11-section brief.
- Starting directly with the backend pipeline (FastAPI, LangChain, LangGraph, Groq, SQLModel) to build a robust, testable extraction and synthesis core before connecting the Next.js frontend.

## Constraints

- **Tech Stack**: Python 3.14, FastAPI, SQLModel (SQLite), LangChain/LangGraph, Groq API, Next.js 16, TypeScript, Tailwind CSS v4.
- **LLM Provider**: Groq via `langchain-groq` for ultra-low latency generation.
- **Grounding**: All extracted facts must link to verbatim quote excerpts from the source transcript.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with backend | Validates LangGraph state machine and Groq extraction before UI wiring | — Pending |
| Deterministic Pydantic schemas | Ensures reliable, structured state output across graph nodes | — Pending |
| Verbatim quote anchoring | Grounding facts in exact quotes prevents hallucinated requirements | — Pending |
| Pre-transcribed text input | Avoids audio transcription latency/complexity in v1 | — Pending |
| Groq LLM Provider | Fast inference speed critical for interactive multi-step graph execution | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-09 after initialization*
