# Phase 6: Correction Logging & Evaluation Datasets (Story 14) - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Capture differences between draft briefs and approved edits, exporting evaluation benchmark datasets, delivering:
- Structured Diff Engine: Computes section-by-section diffs, character deltas, similarity scores, and unified diffs between draft and approved brief content (`EVAL-01`).
- `CorrectionLog` SQLModel Table: Persists section modifications in `correction_logs` table linked to `project_id` and timestamped (`EVAL-01`).
- Automated Approval Integration: `approve_project_brief` service automatically invokes the diff engine upon brief approval (`EVAL-01`).
- Evaluation Dataset Export API: `GET /api/v1/eval/corrections` (JSON list) and `GET /api/v1/eval/export` (JSONL stream) supporting `changed_only` and `project_id` filters (`EVAL-02`).
- CLI Benchmark Exporter: Python CLI entry point (`backend/app/eval/export.py`) exporting evaluation dataset records with paired inputs, agent outputs, and human corrections (`EVAL-02`).
- Comprehensive Test Suite: Unit tests for diff calculation, persistence on approval, API export, and CLI script execution.

</domain>

<decisions>
## Implementation Decisions

### Diff Engine Architecture & Computation
- **D-01:** Standard Library Diffing: Use `difflib.unified_diff` to produce canonical unified diff patches and `difflib.SequenceMatcher.ratio()` to compute float similarity scores between draft and approved section texts.
- **D-02:** Granular Section Tracking: Evaluate all 11 brief sections independently. For each section, record `has_changed = (draft_content != approved_content)`, `character_delta = len(approved) - len(draft)`, and unified diff patch.
- **D-03:** Auto-computation on Brief Approval: Calling `approve_project_brief` (via `POST /projects/{id}/approve`) executes diff calculation atomically within the database transaction. If the user approves without edits, logs record `has_changed=False` with `similarity_ratio=1.0`.

### Database Schema & Relationship
- **D-04:** `CorrectionLog` SQLModel Entity (`backend/app/models/correction.py`):
  - Table: `correction_logs`
  - Fields: `id` (UUID str PK), `project_id` (FK to `projects.id`), `section_key` (str), `draft_content` (str), `approved_content` (str), `has_changed` (bool index), `diff_unified` (Optional[str]), `character_delta` (int), `similarity_ratio` (float), `created_at` (str ISO).
  - Relationship: Linked to `Project.correction_logs`.

### Evaluation Benchmark Dataset Structure (Story 14)
- **D-05:** Gold-Standard Benchmark Schema: Each exported JSONL line follows:
  ```json
  {
    "project_id": "...",
    "section_key": "scope_of_work",
    "transcript_context": "Client: We specifically need SSO via Okta...",
    "confirmed_fact_quotes": ["We specifically need SSO via Okta"],
    "initial_agent_output": "...",
    "human_corrected_output": "...",
    "has_changed": true,
    "similarity_ratio": 0.82,
    "diff_unified": "--- draft\n+++ approved\n...",
    "created_at": "..."
  }
  ```
  Enables regression testing, prompt calibration, and fine-tuning on human corrections.

### Export Interfaces (REST API & CLI)
- **D-06:** FastAPI Eval Router: Mount `/api/v1/eval` endpoints:
  - `GET /api/v1/eval/corrections`: Returns structured JSON array of correction records.
  - `GET /api/v1/eval/export`: Returns JSON Lines (`application/x-ndjson` or text) with optional query params `project_id: Optional[str]` and `changed_only: bool = True`.
- **D-07:** CLI Script: Executable via `python -m backend.app.eval.export --output benchmark.jsonl --changed-only` for local developer and CI pipelines.

</decisions>

<canonical_refs>
## Canonical References

### Project Architecture & Requirements
- `.planning/PROJECT.md` — Core epistemic value and Story 14 tracking.
- `.planning/REQUIREMENTS.md` §EVAL-01, §EVAL-02 — Story 14 requirement contracts.
- `.planning/seeds/eval-dataset-from-corrections.md` — Evaluation dataset requirements.
- `.planning/ROADMAP.md` §Phase 6 — Goals and success criteria.

### Prior Phase Context & Code
- `backend/app/models/brief.py` — `ProjectBrief`, `BriefSection`, 11 predefined sections.
- `backend/app/models/brief_record.py` — `ProjectBriefRecord` storing draft and approved briefs.
- `backend/app/services/workflow.py` — `approve_project_brief` hook point.
- `backend/app/api/workflow.py` — Workflow REST router.
</canonical_refs>
