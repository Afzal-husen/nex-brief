# Plan 06-01 Summary: Correction Logging & Evaluation Datasets (Story 14)

## Overview
Implemented structured diff computation, `CorrectionLog` relational persistence upon human brief approval, the evaluation dataset service, REST API endpoints (`GET /api/v1/eval/corrections` and `GET /api/v1/eval/export`), and the standalone CLI benchmark exporter.

## Key Changes
1. **Relational Model (`backend/app/models/correction.py` & `project.py`):**
   - Created `CorrectionLog` SQLModel table (`correction_logs`) storing `project_id`, `section_key`, `draft_content`, `approved_content`, `has_changed`, `diff_unified`, `character_delta`, `similarity_ratio`, and `created_at`.
   - Linked `Project.correction_logs` relationship with cascade deletion.
   - Exported `CorrectionLog` in `backend/app/models/__init__.py`.
2. **Diff Calculation Engine (`backend/app/services/diff_engine.py`):**
   - Implemented `compute_section_diffs`: Compares all 11 brief sections between draft and approved briefs using standard library `difflib.unified_diff` and `difflib.SequenceMatcher.ratio()`.
   - Computes granular metrics: `has_changed`, unified diff patch, character delta, and similarity ratio.
3. **Approval Hook Integration (`backend/app/services/workflow.py`):**
   - Modified `approve_project_brief` to automatically invoke `compute_section_diffs` atomically on approval.
   - Persists all 11 section records into SQLite within the database transaction, replacing any prior logs for idempotency.
4. **Evaluation Service & REST API (`backend/app/services/eval_service.py` & `backend/app/api/eval.py`):**
   - Implemented `get_correction_logs` and `get_evaluation_dataset`, pairing transcript context and confirmed fact quotes with agent outputs and human corrections.
   - Added `GET /api/v1/eval/corrections` (structured JSON records) and `GET /api/v1/eval/export` (streaming `application/x-ndjson` JSONL benchmark format).
   - Mounted `eval_router` under `/api/v1/eval` in `backend/app/main.py`.
5. **Standalone CLI Exporter (`backend/app/eval/export.py`):**
   - Created CLI entry point runnable via `python -m backend.app.eval.export --output benchmark.jsonl --changed-only` or stdout.
6. **Testing (`backend/tests/test_correction_eval.py`):**
   - Added 4 comprehensive unit and integration tests covering diff calculation, automatic logging on brief approval, API endpoints, and CLI export. Full suite passed (60 passed, 1 skipped).
