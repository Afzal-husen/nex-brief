# Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the LangGraph workflow to FastAPI endpoints with pause and resume capabilities, delivering:
- `POST /projects/{id}/analyze`: Triggers pipeline execution up to `interrupt_before=["synthesize_brief"]`, halting at the human clarification gate and returning extracted facts, contradictions, and prioritized questions (`CLARIFY-02`).
- `POST /projects/{id}/clarify`: Injects user answers and resolved contradictions into the checkpointed graph state, resumes execution through brief synthesis and critique, and returns the generated brief and critique report (`CLARIFY-03`).
- `GET /projects/{id}/brief`: Retrieves the current draft/approved project brief and critique report (`BRIEF-03`).
- `POST /projects/{id}/approve`: Accepts optional user edits to brief sections, marks the brief as approved, and updates project status to `approved` with timestamp (`BRIEF-04`).
- SQLModel entity `ProjectBriefRecord` storing draft briefs, approved briefs, critique reports, and approval metadata.
- Comprehensive API integration tests for all 4 endpoints and lifecycle states.

</domain>

<decisions>
## Implementation Decisions

### API Route Design & Execution Lifecycle
- **D-01:** Synchronous HTTP execution: `POST /projects/{id}/analyze` runs the graph synchronously up to the interrupt gate (2-5s on Groq) and returns extraction results and prioritized follow-up questions immediately. — **Reversibility:** costly — core HTTP API contract.
- **D-02:** Batch clarification submission: `POST /projects/{id}/clarify` accepts a list of `UserClarification` objects, resumes the graph through synthesis and critique, and synchronously returns the resulting draft brief and critique report. — **Reversibility:** costly — consumed by Phase 9 UI.
- **D-03:** Comprehensive brief retrieval: `GET /projects/{id}/brief` returns a unified response payload containing `project_id`, `status`, `draft_brief`, `approved_brief`, `critique_report`, and `approved_at`. — **Reversibility:** costly — consumed by Phase 10 UI.
- **D-04:** Human editorial authority at approval: `POST /projects/{id}/approve` accepts optional section overrides to allow human edits before finalizing, sets project status to `approved`, and records the approval timestamp. — **Reversibility:** costly — core epistemic philosophy.

### LangGraph Interrupt Mechanism & State Persistence
- **D-05:** LangGraph checkpointer interrupt: Graph is compiled with `interrupt_before=["synthesize_brief"]` when invoked via the analyze service, ensuring deterministic pause after question generation (`CLARIFY-02`). — **Reversibility:** costly — pipeline coordination contract.
- **D-06:** State resumption via `update_state`: `POST /projects/{id}/clarify` updates the checkpointed state with `graph.update_state(config, {"user_clarifications": [...]}, as_node="generate_clarifications")` and resumes execution with `graph.invoke(None, config=config)`. — **Reversibility:** costly.
- **D-07:** SQLModel persistence: Introduce `ProjectBriefRecord` table storing brief JSON and critique reports linked by `project_id`, allowing fast relational queries without querying the LangGraph checkpointer blobs. — **Reversibility:** costly — database schema migration.
- **D-08:** Granular project status lifecycle: Update `Project.status` progression: `'created'` -> `'analyzing'` -> `'awaiting_clarification'` -> `'synthesizing'` -> `'ready_for_review'` -> `'approved'`. — **Reversibility:** costly.

### Error Handling & Concurrency
- **D-09:** Missing transcript handling: `POST /projects/{id}/analyze` returns HTTP 400 Bad Request if no transcript has been uploaded for the project. — **Reversibility:** reversible.
- **D-10:** Premature or out-of-sequence clarification: `POST /projects/{id}/clarify` returns HTTP 409 Conflict if project status is not `awaiting_clarification`. — **Reversibility:** reversible.
- **D-11:** Approve without draft brief: `POST /projects/{id}/approve` returns HTTP 400 Bad Request if no draft brief exists to approve. — **Reversibility:** reversible.
- **D-12:** Concurrency guard: If a project is currently `analyzing` or `synthesizing`, subsequent mutate calls return HTTP 409 Conflict to prevent race conditions on thread state. — **Reversibility:** reversible.

### Agent's Discretion
- Exact FastAPI router naming (`backend/app/api/workflow.py` vs `backend/app/api/briefs.py`).
- Pydantic request and response wrapper schemas for endpoints.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture & Requirements
- `.planning/PROJECT.md` — Core epistemic value proposition, grounding constraints, and human editorial authority.
- `.planning/REQUIREMENTS.md` §CLARIFY-02, §CLARIFY-03, §BRIEF-03, §BRIEF-04 — API requirements.
- `.planning/ROADMAP.md` §Phase 5 — Phase 5 goals and success criteria.

### Prior Phase Context & Code
- `.planning/phases/04-brief-synthesis-critique-durable-checkpointing/04-CONTEXT.md` — Brief, critique, and clarification schemas.
- `backend/app/models/brief.py` — `ProjectBrief`, `BriefSection`, `UserClarification`, `CritiqueReport`.
- `backend/app/graph/builder.py` — 6-node LangGraph pipeline.
- `backend/app/services/extraction.py` — Pipeline execution and SqliteSaver checkpointing.
- `backend/app/api/projects.py` — Existing project REST endpoints.
- `backend/app/core/database.py` — Database engine and session dependency.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/api/deps.py`: `get_session` provides SQLModel database session dependency.
- `backend/app/models/project.py`: `Project` model ready for status extension and relation.
- `backend/app/services/extraction.py`: `get_checkpointer()` handles persistent SQLite checkpointer connections.
- `backend/app/graph/builder.py`: `build_extraction_graph` accepts checkpointer and compiles StateGraph.

### Established Patterns
- FastAPI `APIRouter` with Pydantic response models and HTTPException handling.
- SQLModel database operations inside `Session(engine)`.
- Mock overrides in `backend/app/core/llm.py` for hermetic test execution.

### Integration Points
- `backend/app/models/brief_record.py` (or in `brief.py`): Define `ProjectBriefRecord` SQLModel table.
- `backend/app/models/project.py`: Add `status` field choices and relation.
- `backend/app/api/workflow.py` (new): Implement `/projects/{id}/analyze`, `/projects/{id}/clarify`, `/projects/{id}/brief`, and `/projects/{id}/approve`.
- `backend/app/main.py`: Register workflow router in FastAPI application.
- `backend/tests/test_workflow_api.py` (new): Test client integration covering complete pause, resume, inspect, and approve lifecycle.

</code_context>

<specifics>
## Specific Ideas

- The `/analyze` endpoint acts as the first gate: it runs the heavy extraction and questions generation, then stops right before brief synthesis, putting the project into `awaiting_clarification`.
- The `/clarify` endpoint acts as the second gate: the user can submit answers to all, some, or none of the questions. Once submitted, the graph resumes from the breakpoint and synthesizes the brief.
- The `/approve` endpoint completes the human-in-the-loop lifecycle, ensuring no brief is finalized without explicit human sign-off.

</specifics>

<deferred>
## Deferred Ideas

- None — all decisions remain strictly within Phase 5 scope. Correction diff logging belongs in Phase 6.

</deferred>

---

*Phase: 05-workflow-rest-api-human-in-the-loop-endpoints*
*Context gathered: 2026-09-09*
