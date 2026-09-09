# Roadmap: NexBrief

## Overview

NexBrief transforms client discovery call transcripts into clear, structured, and trustworthy project briefs. The architecture is executed in horizontal layers starting with the complete backend AI agent engine and database persistence, followed by the full-stack Next.js interface. Each phase delivers a functional, tested increment of capability.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Backend Foundation & Persistence** - FastAPI application shell, SQLModel models, SQLite database with WAL mode, and project/transcript CRUD endpoints.
- [ ] **Phase 2: Extraction & Grounding Engine** - LangGraph extraction node with Groq (Llama 3.3 70B), Pydantic schemas, and programmatic quote-containment validation.
- [ ] **Phase 3: Contradiction Detection & Follow-up Questions** - Semantic contradiction detection node and prioritized follow-up question generation for unknowns.
- [ ] **Phase 4: Brief Synthesis, Critique & Durable Checkpointing** - 11-section brief synthesis node, self-critique audit node, and SQLite-backed LangGraph state checkpointing.
- [ ] **Phase 5: Workflow REST API & Human-in-the-Loop Endpoints** - FastAPI endpoints to trigger analysis, pause at human gates, submit clarifications, and approve briefs.
- [ ] **Phase 6: Correction Logging & Evaluation Datasets (Story 14)** - Structured diff tracking between draft and approved briefs with JSONL evaluation dataset export.
- [ ] **Phase 7: Frontend API Client & Project Dashboard** - Next.js typed API client, project management dashboard, and navigation skeleton.
- [x] **Phase 8: Transcript Ingestion & Fact Grounding UI** - Transcript paste/upload interface, epistemic breakdown cards, and click-to-highlight quote verification.
- [x] **Phase 9: Interactive Gap Clarification UI** - Review interface for resolving contradictions, answering unknowns, and inspecting follow-up questions.
- [ ] **Phase 10: Brief Markdown Editor & Final Approval UI** - 11-section brief viewer with critique warnings, rich/Markdown editor, and approval sign-off.

## Phase Details

### Phase 1: Backend Foundation & Persistence

**Goal**: Establish the FastAPI application, database configuration, SQLModel tables, and REST endpoints for projects and transcripts.
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, INGEST-01, INGEST-02
**Success Criteria**:

  1. `backend` service starts with FastAPI and passes health check endpoint.
  2. SQLite database initializes with WAL mode and `Project` / `Transcript` tables.
  3. Client projects can be created, read, listed, and deleted via REST API.
  4. Transcripts can be uploaded or pasted, normalized, and persisted to SQLite.
  5. Automated test suite (pytest + HTTPX) passes cleanly covering health, project CRUD, and transcript normalization.

**Plans**: 2 plans

Plans:
**Wave 1**

- [x] 01-01: Setup pyproject dependencies, SQLite engine, SQLModel tables, and FastAPI app factory.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02: Implement project and transcript API routers with normalization and automated pytest suite.

### Phase 2: Extraction & Grounding Engine

**Goal**: Build the LangGraph knowledge extraction node powered by Groq and enforce strict programmatic verbatim quote anchoring.
**Depends on**: Phase 1
**Requirements**: EXTRACT-01, EXTRACT-02, EXTRACT-03, EXTRACT-04
**Success Criteria**:

  1. Groq client initialized with structured output Pydantic schemas for `ConfirmedFact`, `InferredPoint`, and `UnknownGap`.
  2. Extraction node extracts client facts accompanied by exact `source_quote` text.
  3. Programmatic assertion verifies each `source_quote` is a literal substring of `transcript_text`, rejecting hallucinated quotes.
  4. Inferences are explicitly distinguished from client-stated facts.

**Plans**: 2 plans

Plans:

- [x] 02-01: Define domain Pydantic schemas and Groq structured output extraction client.
- [x] 02-02: Implement extraction node with verbatim quote substring verification and unit tests.

### Phase 3: Contradiction Detection & Follow-up Questions

**Goal**: Add contradiction detection and prioritized question generation to the LangGraph state machine.
**Depends on**: Phase 2
**Requirements**: EXTRACT-05, CLARIFY-01
**Success Criteria**:

  1. Contradiction node flags mutually exclusive statements and conflicting claims in transcript.
  2. Question generator produces 3-5 high-priority questions targeting identified unknowns.
  3. Questions are ranked by impact on scoping decisions.

**Plans**: 2 plans

Plans:

- [x] 03-01: Build contradiction detection node with claim comparison logic.
- [x] 03-02: Build follow-up question prioritization node with test suite.

### Phase 4: Brief Synthesis, Critique & Durable Checkpointing

**Goal**: Implement the 11-section brief synthesis node, automated critique node, and durable SQLite checkpointing.
**Depends on**: Phase 3
**Requirements**: DATA-04, BRIEF-01, BRIEF-02
**Success Criteria**:

  1. Synthesis node generates all 11 required sections grounded in confirmed facts and user clarifications.
  2. Critique node audits the brief for unsupported assumptions or missing constraints.
  3. LangGraph checkpoints state to SQLite, allowing resumption across process restarts.

**Plans**: 2 plans

Plans:

- [x] 04-01: Implement 11-section brief synthesis node and critique audit node.
- [x] 04-02: Integrate SQLite persistent checkpointer and state recovery tests.

### Phase 5: Workflow REST API & Human-in-the-Loop Endpoints

**Goal**: Connect the LangGraph workflow to FastAPI endpoints with pause and resume capabilities.
**Depends on**: Phase 4
**Requirements**: CLARIFY-02, CLARIFY-03, BRIEF-03, BRIEF-04
**Success Criteria**:

  1. `POST /projects/{id}/analyze` triggers pipeline and halts at clarification interrupt.
  2. `POST /projects/{id}/clarify` injects user answers and resumes graph to synthesize brief.
  3. `POST /projects/{id}/approve` records final brief approval state.

**Plans**: 2 plans

Plans:

- [x] 05-01: Expose workflow execution and human interrupt status endpoints.
- [x] 05-02: Expose clarification submission and approval endpoints with integration tests.

### Phase 6: Correction Logging & Evaluation Datasets (Story 14)

**Goal**: Capture differences between draft briefs and approved edits, exporting eval datasets.
**Depends on**: Phase 5
**Requirements**: EVAL-01, EVAL-02
**Success Criteria**:

  1. Diff engine computes section-level modifications between draft and final brief.
  2. Structured diffs are persisted in `correction_log` table.
  3. CLI/API exports logged corrections as JSONL benchmark dataset.

**Plans**: 1 plan

Plans:

- [x] 06-01: Implement diff calculation, `CorrectionLog` persistence, and JSONL export endpoint.

### Phase 7: Frontend API Client & Project Dashboard

**Goal**: Connect Next.js frontend to FastAPI backend and build project management views.
**Depends on**: Phase 5
**Requirements**: UI-01
**Success Criteria**:

  1. Typed API client communicates with backend endpoints with error handling.
  2. User can view list of projects with status indicators on dashboard.
  3. User can create new projects and delete existing projects.

**Plans**: 2 plans

Plans:

- [x] 07-01: Setup typed API client and backend connection configuration.
- [x] 07-02: Build project dashboard, creation modal, and project layout.

### Phase 8: Transcript Ingestion & Fact Grounding UI

**Goal**: Build transcript upload interface and epistemic fact cards with verbatim quote highlighting.
**Depends on**: Phase 7
**Requirements**: UI-02, UI-03
**Success Criteria**:

  1. User can paste or upload transcript files with character count and preview.
  2. User can view confirmed facts vs inferred points in epistemic badge cards.
  3. Clicking any fact highlights and scrolls to its verbatim quote in the transcript view.

**Plans**: 2 plans

Plans:

- [x] 08-01: Implement transcript paste/upload and viewing component.
- [x] 08-02: Implement fact/inference cards with interactive quote highlighting.

### Phase 9: Interactive Gap Clarification UI

**Goal**: Provide an interface for answering unknowns and reviewing contradictions before brief generation.
**Depends on**: Phase 8
**Requirements**: UI-04
**Success Criteria**:

  1. User can view identified gaps and input manual clarifications.
  2. User can review flagged contradictions and select preferred resolutions.
  3. User can trigger brief generation once clarifications are complete.

**Plans**: 1 plan

Plans:

- [x] 09-01: Build gap resolution form, contradiction resolver, and resume trigger.

### Phase 10: Brief Markdown Editor & Final Approval UI

**Goal**: Deliver the 11-section brief viewer, critique review panel, Markdown editor, and approval gate.
**Depends on**: Phase 9
**Requirements**: UI-05
**Success Criteria**:

  1. User can review the synthesized 11-section brief with critique warnings highlighted.
  2. User can edit any section using a Markdown editor.
  3. User can click "Approve Brief" to finalize the brief and trigger correction logging.

**Plans**: 2 plans

Plans:

- [ ] 10-01: Build 11-section brief reader and critique display component.
- [ ] 10-02: Build Markdown editor with diff review and final approval workflow.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend Foundation & Persistence | 2/2 | Complete | 2026-09-09 |
| 2. Extraction & Grounding Engine | 2/2 | Complete | 2026-09-09 |
| 3. Contradiction Detection & Follow-up Questions | 2/2 | Complete | 2026-09-09 |
| 4. Brief Synthesis, Critique & Durable Checkpointing | 2/2 | Complete | 2026-09-09 |
| 5. Workflow REST API & Human-in-the-Loop Endpoints | 2/2 | Complete | 2026-09-09 |
| 6. Correction Logging & Evaluation Datasets | 1/1 | Complete | 2026-09-09 |
| 7. Frontend API Client & Project Dashboard | 2/2 | Complete | 2026-09-09 |
| 8. Transcript Ingestion & Fact Grounding UI | 2/2 | Complete | 2026-09-09 |
| 9. Interactive Gap Clarification UI | 1/1 | Complete | 2026-09-09 |
| 10. Brief Markdown Editor & Final Approval UI | 0/2 | Not started | - |
