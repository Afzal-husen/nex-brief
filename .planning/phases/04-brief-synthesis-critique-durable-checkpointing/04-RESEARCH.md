# Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Research

**Researched:** 2026-09-09
**Domain:** LangGraph State Machine, LLM Brief Synthesis, Automated Critique Engine, SQLite Checkpointer Persistence
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 (11-Section Brief Schema):** Strongly typed dictionary/model of 11 predefined sections (`BriefSection`) with keys: `executive_summary`, `objectives_success_criteria`, `target_audience`, `scope_of_work`, `out_of_scope`, `technical_architecture`, `assumptions_inferences`, `risks_contradictions`, `budget_commercials`, `timeline_milestones`, and `outstanding_questions`. Each section contains `title: str`, `content: str` (markdown), `source_fact_ids: list[str]`, `inference_ids: list[str]`, and `supporting_clarification_ids: list[str]`.
- **D-02 (Unaddressed Section Handling):** If transcript has zero data on a section (e.g. Budget or Timeline), the section explicitly outputs `"Not discussed in discovery call"` with linked unknowns/questions rather than hallucinated filler.
- **D-03 (Synthesis Generation Strategy):** Single synthesis prompt with structured output specifying all 11 sections at once via Groq (`llama-3.3-70b-versatile` with `llama-3.1-8b-instant` fallback, `temperature=0.0`).
- **D-04 (Dual Representation):** Output both structured section models (`sections: dict[str, BriefSection]`) and a compiled unified markdown document string (`full_markdown: str`).
- **D-05 (Advisory Critique Notes):** Automated critique attaches structured audit notes (`critique_report: CritiqueReport`) for human review without silently mutating or rewriting brief content.
- **D-06 (Critique Dimensions):** Four issue types: `ungrounded_claim`, `contradiction_neglect`, `missing_constraint`, and `vague_deliverable`.
- **D-07 (Structured CritiqueReport):** Quality score (0-100), overall summary, and list of `CritiqueIssue` items with `section_key`, `issue_type`, `severity` (`critical`/`warning`/`info`), `explanation`, and `suggested_fix`.
- **D-08 (Independent Critique Execution):** Dedicated structured LLM call on Groq comparing draft brief against confirmed facts, inferences, active contradictions, and transcript text.
- **D-09 (User Clarification Schema):** `UserClarification` (`question_id: str`, `resolved_text: str`, `resolved_by: str = "user"`), tracked in `ExtractionState` as `user_clarifications: list[UserClarification]`.
- **D-10 (Prompt Injection):** Injected under `'USER CLARIFICATIONS & RESOLUTIONS'` prompt block as authoritative facts overriding transcript ambiguities.
- **D-11 (Zero Clarifications Fallback):** If `user_clarifications: []`, synthesis proceeds smoothly, surfacing unresolved gaps in Section 8 & Section 11.
- **D-12 (Clarification Traceability):** Each section tracks `supporting_clarification_ids: list[str]`.
- **D-13 (Persistent SQLite Checkpointer):** `SqliteSaver` persists state checkpoints in SQLite tables inside the database across restarts (`DATA-04`).
- **D-14 (Thread ID Formatting):** `thread_id = f"project:{project_id}:transcript:{transcript_id}"` (or `transcript_id`).
- **D-15 (Extended 6-Node Pipeline):** LangGraph sequence: `extract_knowledge` -> `verify_grounding` -> `detect_contradictions` -> `generate_clarifications` -> `synthesize_brief` -> `critique_brief` -> `END`.
- **D-16 (Resumption Verification):** Hermetic integration test validating full state recovery across simulated restarts.

### Deferred Ideas (OUT OF SCOPE)
- REST API endpoints for human clarification and brief approval (`CLARIFY-02`, `CLARIFY-03`, `BRIEF-03`, `BRIEF-04` — Phase 5).
- Frontend brief editor and approval UI (`UI-05` — Phase 10).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Brief & Critique Domain Models | `backend/app/models/brief.py` | `backend/app/models/__init__.py` | Defines `BriefSection`, `ProjectBrief`, `UserClarification`, `CritiqueIssue`, `CritiqueReport` |
| State Graph Extension | `backend/app/graph/state.py` | LangGraph State | Extends `ExtractionState` with `user_clarifications`, `draft_brief`, `critique_report` |
| Brief Synthesis Node | `backend/app/graph/nodes/synthesize_brief.py` | `backend/app/graph/nodes/__init__.py` | Synthesizes 11 sections from confirmed facts + user clarifications + Groq LLM |
| Critique Audit Node | `backend/app/graph/nodes/critique_brief.py` | `backend/app/graph/nodes/__init__.py` | Audits draft brief against grounded state and yields structured `CritiqueReport` |
| 6-Node Graph Pipeline | `backend/app/graph/builder.py` | LangGraph Runtime | Wires sequential 6-node state machine with persistent SQLite checkpointer |
| Pipeline Service & Checkpointer | `backend/app/services/extraction.py` | Core DB Engine | Coordinates pipeline invocation, thread IDs, and durable `SqliteSaver` checkpoints |
| Test Suites | `tests/unit/test_brief_synthesis.py`, `tests/unit/test_critique.py`, `tests/integration/test_state_checkpointing.py` | Pytest Runner | Hermetic unit tests and process restart resumption verification |

</architectural_responsibility_map>

<research_findings>
## Technical Analysis & Patterns

### 1. 11-Section Brief Structure & Pydantic Modeling
To satisfy `BRIEF-01`, `D-01`, `D-02`, and `D-04`:
- Predefined section keys enum / literals:
  1. `executive_summary`: Executive Summary & Client Background
  2. `objectives_success_criteria`: Project Objectives & Success Criteria
  3. `target_audience`: Target Audience & User Personas
  4. `scope_of_work`: In-Scope Deliverables & Features
  5. `out_of_scope`: Out-of-Scope Boundaries
  6. `technical_architecture`: Technical Architecture & Constraints
  7. `assumptions_inferences`: Inferred Assumptions & Working Hypotheses
  8. `risks_contradictions`: Known Risks & Transcript Contradictions
  9. `budget_commercials`: Budget, Commercials & Payment Terms
  10. `timeline_milestones`: Timeline, Phases & Milestones
  11. `outstanding_questions`: Outstanding Questions & Immediate Next Steps

Each section is represented as:
```python
class BriefSection(BaseModel):
    key: str
    title: str
    content: str  # Markdown text
    source_fact_ids: list[str] = Field(default_factory=list)
    inference_ids: list[str] = Field(default_factory=list)
    supporting_clarification_ids: list[str] = Field(default_factory=list)
```

The overall brief model:
```python
class ProjectBrief(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    transcript_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sections: dict[str, BriefSection]
    full_markdown: str
```

### 2. Synthesis Prompt Architecture & Groq Invocation
The prompt feeds:
1. `confirmed_facts` (with IDs, categories, source quotes)
2. `inferred_points` (with IDs, rationale, source fact IDs)
3. `contradictions` (with paired claims and quotes)
4. `unknown_gaps` (with impact level and suggested questions)
5. `user_clarifications` (under `'USER CLARIFICATIONS & RESOLUTIONS'` as authoritative guidance)
6. Instruction: "For any section where no facts, inferences, or clarifications exist (e.g. Budget or Timeline), do not extrapolate or hallucinate. Explicitly set content to 'Not discussed in discovery call' and list the outstanding questions that should be resolved."

Target structured output model for LLM:
```python
class RawBriefSection(BaseModel):
    title: str
    content: str
    source_fact_ids: list[str] = Field(default_factory=list)
    inference_ids: list[str] = Field(default_factory=list)
    supporting_clarification_ids: list[str] = Field(default_factory=list)

class RawBriefPayload(BaseModel):
    sections: dict[str, RawBriefSection]
```
The node formats the dictionary into `ProjectBrief` and compiles `full_markdown` by joining `# Project Brief\n\n` + section titles (`## {title}\n\n{content}\n\n`).

### 3. Critique Audit Engine (`BRIEF-02`)
The critique node evaluates the drafted `ProjectBrief` against the input transcript facts:
```python
class CritiqueIssue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_key: str
    issue_type: Literal["ungrounded_claim", "contradiction_neglect", "missing_constraint", "vague_deliverable"]
    severity: Literal["critical", "warning", "info"]
    explanation: str
    suggested_fix: str

class CritiqueReport(BaseModel):
    score: int = Field(ge=0, le=100)
    summary: str
    issues: list[CritiqueIssue] = Field(default_factory=list)
```
Prompt instructs LLM to check:
1. `ungrounded_claim`: Claims in deliverables or constraints not present in confirmed facts or user clarifications.
2. `contradiction_neglect`: Sections that take a side on a detected contradiction without acknowledging the conflict or user resolution.
3. `missing_constraint`: Stated client constraints (e.g. compliance, existing tech stack) omitted from Section 6.
4. `vague_deliverable`: Scope items with ambiguous requirements.

Score calculation: Baseline 100, deducted per critical issue (-20), warning (-10), info (-2), minimum 0.

### 4. Durable SQLite Checkpointing (`DATA-04`, `D-13`, `D-14`)
`SqliteSaver` from `langgraph.checkpoint.sqlite` creates tables `checkpoints`, `checkpoint_blobs`, `checkpoint_writes` in the SQLite database.
To ensure thread-safety across runs and test isolation:
- `backend/app/services/extraction.py` resolves database path from `settings.DATABASE_URL`.
- Thread ID is set to `f"project:{project_id}:transcript:{transcript_id}"` or `transcript_id`.
- Test suite verifies recovery by invoking nodes up to a point, disconnecting the graph, creating a fresh graph instance connected to the same SQLite file, and resuming execution from the last checkpoint.

</research_findings>

---
*Phase: 04-brief-synthesis-critique-durable-checkpointing*
*Researched: 2026-09-09*
