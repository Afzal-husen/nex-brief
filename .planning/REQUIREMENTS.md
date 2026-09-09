# Requirements: NexBrief

**Defined:** 2026-09-09
**Core Value:** Turn unstructured discovery transcripts into verifiable, grounded project briefs where every fact is anchored to client statements, inferences are transparently labeled, and the user retains complete editorial authority.

## v1 Requirements

### Data Model & Persistence (Backend Core)

- [ ] **DATA-01**: System initializes SQLite database via SQLModel with connection pooling and WAL mode.
- [ ] **DATA-02**: User can manage projects (create, read, list, delete) stored in `project` table.
- [ ] **DATA-03**: User can store raw transcripts in `transcript` table linked to project.
- [x] **DATA-04**: System persists LangGraph checkpoint state in durable SQLite storage across restarts.

### Ingestion & API Layer

- [ ] **INGEST-01**: User can submit pre-transcribed text via REST API endpoint (`POST /projects/{id}/transcripts`).
- [ ] **INGEST-02**: System normalizes transcript text (whitespace, speaker markers, lines) before analysis.

### Knowledge Extraction & Grounding

- [x] **EXTRACT-01**: System extracts confirmed facts and links each to a verbatim `source_quote`.
- [x] **EXTRACT-02**: System programmatically validates that every `source_quote` exists as an exact substring in `transcript_text`.
- [x] **EXTRACT-03**: System identifies inferred deductions and marks them explicitly with epistemic status `inferred`.
- [x] **EXTRACT-04**: System identifies missing critical information gaps (`unknowns`) needed to scope the project.
- [x] **EXTRACT-05**: System detects internal contradictions or mutually exclusive statements made in the transcript.

### Clarification & Human Interrupt Gate

- [x] **CLARIFY-01**: System generates top 3-5 prioritized follow-up questions targeting the identified unknowns.
- [ ] **CLARIFY-02**: System interrupts graph execution after extraction to expose state for human inspection.
- [ ] **CLARIFY-03**: User can submit clarifications, answer unknowns, and resolve contradictions via REST API (`POST /projects/{id}/clarify`).

### Brief Synthesis & Critique

- [x] **BRIEF-01**: System synthesizes an 11-section project brief grounded in confirmed facts and user clarifications.
- [x] **BRIEF-02**: System runs an automated self-critique node flagging ungrounded claims or hallucinated scope.
- [ ] **BRIEF-03**: User can inspect the draft brief and critique notes via REST API (`GET /projects/{id}/brief`).
- [ ] **BRIEF-04**: User can edit brief sections and submit final approval (`POST /projects/{id}/approve`).

### Evaluation & Learning (Story 14)

- [ ] **EVAL-01**: System computes and records structured diffs between the draft brief and user-approved brief in `correction_log` table.
- [ ] **EVAL-02**: User can export correction logs as JSONL datasets for prompt evaluation and regression benchmarking.

### Frontend Experience

- [ ] **UI-01**: User can view project dashboard, manage projects, and track status.
- [ ] **UI-02**: User can upload or paste transcript and view formatted text.
- [ ] **UI-03**: User can view extracted facts, inferences, unknowns, and click a fact to highlight its quote in the transcript.
- [ ] **UI-04**: User can clarify unknowns and resolve contradictions in a dedicated review interface.
- [ ] **UI-05**: User can edit the 11-section brief in a Markdown editor and submit final approval.

## v2 Requirements

### Extended Integrations

- **EXT-01**: Direct Zoom / Google Meet bot integration to ingest recorded call transcripts automatically.
- **EXT-02**: Export final approved briefs directly to Notion, Google Docs, or Jira.
- **EXT-03**: Support audio file uploads with server-side speech-to-text transcription.

### Collaboration & Customization

- **TEAM-01**: Multi-user workspace accounts with role-based access control.
- **TMPL-01**: Custom agency brief templates with configurable section schemas.

## Out of Scope

| Feature | Reason |
|---------|--------|
| In-app real-time audio recording & transcription | Heavy dependency overhead and latency; pre-transcribed text input satisfies MVP |
| Multi-tenant team authentication | Adds auth complexity not required for single-operator MVP |
| Direct CRM two-way syncing | Defer post-validation; Markdown/JSON export provides immediate utility |
| Autonomous brief delivery without human approval | Violates core product philosophy: briefs must have human sign-off |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 4 | Pending |
| INGEST-01 | Phase 1 | Pending |
| INGEST-02 | Phase 1 | Pending |
| EXTRACT-01 | Phase 2 | Pending |
| EXTRACT-02 | Phase 2 | Pending |
| EXTRACT-03 | Phase 2 | Pending |
| EXTRACT-04 | Phase 2 | Pending |
| EXTRACT-05 | Phase 2 | Pending |
| CLARIFY-01 | Phase 3 | Pending |
| CLARIFY-02 | Phase 3 | Pending |
| CLARIFY-03 | Phase 3 | Pending |
| BRIEF-01 | Phase 4 | Pending |
| BRIEF-02 | Phase 4 | Pending |
| BRIEF-03 | Phase 5 | Pending |
| BRIEF-04 | Phase 5 | Pending |
| EVAL-01 | Phase 6 | Pending |
| EVAL-02 | Phase 6 | Pending |
| UI-01 | Phase 7 | Pending |
| UI-02 | Phase 8 | Pending |
| UI-03 | Phase 8 | Pending |
| UI-04 | Phase 9 | Pending |
| UI-05 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-09*
*Last updated: 2026-09-09 after initial definition*
