# Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Research

**Researched:** 2026-09-09
**Domain:** FastAPI REST APIs, LangGraph Human-in-the-loop (Interrupt & Resume), SQLModel Persistence
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 (Synchronous Analyze):** `POST /projects/{id}/analyze` triggers graph execution up to `interrupt_before=["synthesize_brief"]`, returns extraction state, facts, active contradictions, and prioritized questions (`CLARIFY-02`).
- **D-02 (Batch Clarification Submission):** `POST /projects/{id}/clarify` accepts a list of `UserClarification` objects, updates checkpoint state, resumes graph execution through brief synthesis and critique, and returns draft brief and critique report (`CLARIFY-03`).
- **D-03 (Comprehensive Brief Inspection):** `GET /projects/{id}/brief` returns combined payload: `project_id`, `status`, `draft_brief`, `approved_brief`, `critique_report`, and `approved_at` (`BRIEF-03`).
- **D-04 (Human Editorial Authority at Approval):** `POST /projects/{id}/approve` accepts optional section overrides to allow human edits before finalizing, sets project status to `approved`, and records approval timestamp (`BRIEF-04`).
- **D-05 (LangGraph Interrupt Mechanism):** Compile graph with `interrupt_before=["synthesize_brief"]` when invoked via analyze service.
- **D-06 (State Resumption):** Use `graph.update_state(config, {"user_clarifications": [...]}, as_node="generate_clarifications")` followed by `graph.invoke(None, config=config)`.
- **D-07 (SQLModel Persistence):** Dedicated `ProjectBriefRecord` table storing brief JSON, critique reports, and approval records linked by `project_id`.
- **D-08 (Project Status Lifecycle):** Progression: `'created'` -> `'analyzing'` -> `'awaiting_clarification'` -> `'synthesizing'` -> `'ready_for_review'` -> `'approved'`.
- **D-09 (Missing Transcript):** HTTP 400 Bad Request if analyze called without a transcript.
- **D-10 (Invalid Clarify State):** HTTP 409 Conflict if clarify called outside `awaiting_clarification`.
- **D-11 (Approve Without Brief):** HTTP 400 Bad Request if approve called without a draft brief.
- **D-12 (Concurrency Guard):** HTTP 409 Conflict if request received while project is `analyzing` or `synthesizing`.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Brief Record Model | `backend/app/models/brief_record.py` | `backend/app/models/__init__.py` | SQLModel table for persisting brief versions & approval metadata |
| Project Status Field | `backend/app/models/project.py` | Database Schema | Adds status enum field and default value |
| Workflow API Router | `backend/app/api/workflow.py` | `backend/app/main.py` | FastAPI route implementations for `/analyze`, `/clarify`, `/brief`, `/approve` |
| Workflow Service Coordination | `backend/app/services/workflow.py` | `backend/app/services/extraction.py` | Coordinates LangGraph interrupt, state update, resumption, and SQLModel writes |
| API Integration Tests | `backend/tests/test_workflow_api.py` | Pytest Runner | Comprehensive tests for the 4 endpoints and error conditions |

</architectural_responsibility_map>

<research_findings>
## Technical Analysis & Patterns

### 1. LangGraph Interrupt & Resume Mechanics
In LangGraph with `SqliteSaver`:
```python
# 1. Compile with interrupt
graph = build_extraction_graph(checkpointer=active_checkpointer)
# Or configure interrupt_before when compiling:
compiled_graph = workflow.compile(checkpointer=active_checkpointer, interrupt_before=["synthesize_brief"])

# 2. Invoke up to interrupt
result_state = compiled_graph.invoke(initial_state, config=config)
# Pipeline executes: extract_knowledge -> verify_grounding -> detect_contradictions -> generate_clarifications -> PAUSE

# 3. Inspect state
state_snapshot = compiled_graph.get_state(config)
# state_snapshot.next contains ('synthesize_brief',)

# 4. Resume with user clarifications
compiled_graph.update_state(config, {"user_clarifications": user_clarifications}, as_node="generate_clarifications")
final_state = compiled_graph.invoke(None, config=config)
# Pipeline resumes: synthesize_brief -> critique_brief -> END
```

### 2. SQLModel Entity: `ProjectBriefRecord`
```python
class ProjectBriefRecord(SQLModel, table=True):
    __tablename__ = "project_brief"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(index=True, foreign_key="project.id")
    draft_brief_json: str | None = None
    approved_brief_json: str | None = None
    critique_report_json: str | None = None
    status: str = Field(default="draft")
    approved_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### 3. Endpoint Specifications
- `POST /api/v1/projects/{id}/analyze`:
  - Validates transcript exists.
  - Updates project status to `analyzing`, runs graph to interrupt.
  - Updates project status to `awaiting_clarification`.
  - Returns `confirmed_facts`, `inferred_points`, `contradictions`, `unknown_gaps`, `clarification_questions`.
- `POST /api/v1/projects/{id}/clarify`:
  - Validates status is `awaiting_clarification`.
  - Accepts `list[UserClarification]`.
  - Updates project status to `synthesizing`, resumes graph.
  - Writes `draft_brief` and `critique_report` to `ProjectBriefRecord`.
  - Updates project status to `ready_for_review`.
  - Returns `draft_brief` and `critique_report`.
- `GET /api/v1/projects/{id}/brief`:
  - Retrieves `ProjectBriefRecord` for `project_id`.
  - Returns `draft_brief`, `approved_brief`, `critique_report`, `status`, `approved_at`.
- `POST /api/v1/projects/{id}/approve`:
  - Accepts optional updated brief or sections dictionary.
  - Updates `approved_brief_json`, sets status to `approved`, stamps `approved_at`.
  - Returns finalized approved brief.

</research_findings>

---
*Phase: 05-workflow-rest-api-human-in-the-loop-endpoints*
*Researched: 2026-09-09*
