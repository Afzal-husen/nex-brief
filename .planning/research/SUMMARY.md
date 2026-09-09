# Project Research Summary

**Project:** NexBrief
**Domain:** AI-Powered Discovery Call Analysis & Project Brief Synthesis
**Researched:** 2026-09-09
**Confidence:** HIGH

## Executive Summary

NexBrief is designed to eliminate the friction, ambiguity, and inaccuracy often found in traditional client discovery and project brief creation. Rather than treating discovery call transcripts as generic text to summarize, NexBrief functions as an epistemic partner. It systematically segments client dialog into confirmed verbatim facts, AI inferences, unknowns/gaps, and contradictions, empowers the user with prioritized follow-up questions, and synthesizes an approved 11-section project brief with human sign-off at every critical juncture.

The recommended architectural approach couples a **FastAPI** backend with **LangGraph** state machine orchestration, powered by **Groq**'s ultra-low latency Llama 3.3 70B model using structured Pydantic schemas. Data persistence is managed via **SQLModel / SQLite** to guarantee that graph execution states and user corrections (Story 14) survive server restarts without external infrastructure complexity. The **Next.js 16** frontend connects seamlessly to this backend to deliver rapid visual inspection, transcript quote highlighting, and brief authoring.

Key risks center on hallucinated quotes and ephemeral in-memory state loss. These are directly mitigated by programmatic string-containment validation for all extracted quotes, speaker-turn aware prompt schemas, and durable SQLite checkpointing.

## Key Findings

### Recommended Stack

The backend will be built on Python 3.14 using FastAPI, SQLModel, SQLite, LangGraph, and `langchain-groq`. The frontend leverages the existing Next.js 16 App Router scaffold with Tailwind CSS v4.

**Core technologies:**
- **FastAPI (^0.115.0):** High-speed asynchronous REST API framework with native OpenAPI and Pydantic validation.
- **LangGraph (^0.2.70):** Cyclic state machine engine supporting durable checkpoints, state branching, and human-in-the-loop interruption.
- **Groq (Llama 3.3 70B):** Sub-second token generation for multi-step structured extraction without UX latency bottlenecks.
- **SQLModel / SQLite:** Zero-setup local relational persistence for projects, transcripts, analysis states, and correction logs.

### Expected Features

**Must have (table stakes):**
- Project creation and transcript ingestion (paste or file upload).
- Deterministic extraction of confirmed statements with exact transcript quotes.
- Inferred points labeled as assumptions; unknowns and internal contradictions identified.
- Top 3-5 prioritized follow-up questions for missing requirements.
- 11-section structured project brief synthesis and critique.
- Human review, edit, and sign-off gates.
- Correction logging for eval datasets (Story 14).

**Should have (competitive):**
- Verbatim quote highlighting linking brief claims directly to the transcript position.
- Self-critique audit node flagging ungrounded claims before user review.

**Defer (v2+):**
- Live audio recording / transcription bot integrations.
- Multi-user team workspace permissions.

### Architecture Approach

The architecture cleanly decouples the AI orchestration engine from the web server. The FastAPI layer acts as an API gateway that manages projects and transcripts in SQLite, while delegating analysis to a LangGraph `StateGraph(BriefState)`. The state graph executes extraction nodes, interrupts for human clarification, resumes upon user input, synthesizes the brief, runs a critique node, and halts for final approval.

**Major components:**
1. **API & Database Layer (`backend/app/api/`, `backend/app/models/`):** CRUD endpoints and SQLModel SQLite tables.
2. **LangGraph Agent Engine (`backend/app/agent/`):** State graph coordinating extraction, contradiction detection, question prioritization, and brief synthesis.
3. **Frontend App (`frontend/src/`):** Responsive Next.js UI providing transcript viewing, interactive gap clarification, and brief approval.

### Critical Pitfalls

1. **Hallucinated Citations:** Prevented by programmatic assertions verifying `quote in transcript_text`.
2. **Conflating Interviewer Questions with Client Statements:** Prevented by speaker-aware prompt modeling and extraction schemas.
3. **Lost State Across Restarts:** Prevented by durable SQLite checkpointing rather than volatile in-memory storage.
4. **Groq Rate Limiting:** Prevented by single-pass structured extraction and intermediate state reuse.

## Implications for Roadmap

Given user's explicit preference for starting with the backend and utilizing fine-grained phases (8-12 phases), the roadmap should be structured logically from backend core to full stack integration:

### Phase 1: Backend Foundation & Data Persistence
**Rationale:** Establishes the database, models, and FastAPI application shell needed for all downstream work.
**Delivers:** FastAPI server, SQLModel tables (`Project`, `Transcript`, `Brief`, `CorrectionLog`), SQLite database with migrations/init, and health check tests.
**Addresses:** Project management and transcript storage.

### Phase 2: Domain Schemas & Groq Client Setup
**Rationale:** Locks down the Pydantic data contracts for facts, inferences, unknowns, contradictions, and briefs before graph assembly.
**Delivers:** Typed state schemas (`BriefState`), Groq LLM integration with fallback handling, and test fixtures.

### Phase 3: LangGraph Extraction & Verification Pipeline
**Rationale:** Implements the core value proposition: grounded fact extraction with verbatim quote matching.
**Delivers:** Extraction node, contradiction detector, question generator, and programmatic quote-containment validator.
**Avoids:** Pitfalls 1 & 2 (hallucinated quotes and speaker confusion).

### Phase 4: LangGraph Synthesis, Critique & Checkpointing
**Rationale:** Completes the graph by adding 11-section brief generation, critique auditing, and durable SQLite checkpointing.
**Delivers:** Synthesis node, critique node, interrupt gates, and state persistence across server restarts.
**Avoids:** Pitfall 3 (state loss).

### Phase 5: Workflow REST API & Human-in-the-Loop Endpoints
**Rationale:** Exposes graph execution, state inspection, and resumption to HTTP clients.
**Delivers:** `/api/projects/{id}/analyze`, `/resume`, `/approve` endpoints with integration tests.

### Phase 6: Frontend API Client & Project Dashboard
**Rationale:** Connects the Next.js frontend to the backend service.
**Delivers:** Backend API client, project creation and list view, project settings.

### Phase 7: Transcript Ingestion & Fact Grounding UI
**Rationale:** Enables users to paste transcripts and visually inspect extracted facts with verbatim quote linking.
**Delivers:** Transcript upload view, epistemic breakdown cards (Confirmed vs Inferred), and quote-to-transcript highlighting.

### Phase 8: Gap Clarification & Question Review UI
**Rationale:** Delivers the first human-in-the-loop review interface before brief synthesis.
**Delivers:** UI for answering unknowns, resolving contradictions, and reviewing prioritized follow-up questions.

### Phase 9: Brief Synthesis, Critique Display & Markdown Editor
**Rationale:** Presents the generated 11-section brief, displays critique flags, and allows full editorial control.
**Delivers:** Brief view, critique panel, Markdown editor, and approval button.

### Phase 10: Correction Logging & Evaluation Dataset Export (Story 14)
**Rationale:** Captures diffs between drafts and approved briefs, exporting JSONL eval datasets.
**Delivers:** Diff calculation engine, `CorrectionLog` persistence, and dataset export endpoint/CLI.

### Phase 11: End-to-End Polish & Verification
**Rationale:** Complete system verification across realistic client discovery calls.
**Delivers:** E2E smoke tests, error boundaries, documentation, and local dev run scripts.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | FastAPI, SQLModel, LangGraph, Groq, and Next.js are thoroughly documented and well-supported |
| Features | HIGH | Directly aligned with `docs/product_requirements.md` user stories 1–14 |
| Architecture | HIGH | Standard decoupled ASGI + LangGraph DAG architecture |
| Pitfalls | HIGH | Known failure modes identified with concrete programmatic mitigations |

**Overall confidence:** HIGH

### Gaps to Address

- **Python 3.14 Dependency Compatibility:** Verify all wheel binaries (e.g. `pydantic-core`, `uvloop`) install smoothly on Python 3.14 on Windows; fall back to Python 3.12 if needed.
- **Groq Structured Outputs:** Validate `with_structured_output` schema constraints with Llama 3.3 70B during Phase 2.

## Sources

### Primary (HIGH confidence)
- `docs/product_requirements.md`
- LangGraph official documentation
- Groq Cloud API documentation
- FastAPI & SQLModel official documentation

---
*Research completed: 2026-09-09*
*Ready for roadmap: yes*
