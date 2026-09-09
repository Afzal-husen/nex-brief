# Phase 6: Correction Logging & Evaluation Datasets (Story 14) - Research

**Researched:** 2026-09-09
**Domain:** Text Diffing, SQLModel Persistence, JSONL Evaluation Datasets, FastAPI Streaming & CLI

---

## 1. Technical Stack & Standard Library Utilization

### Python `difflib` for Section-Level Diffs
Python's built-in `difflib` provides standard diffing without external dependencies:
- **Unified Diff Generation:**
  ```python
  import difflib

  def compute_unified_diff(draft: str, approved: str, section_name: str) -> str:
      draft_lines = draft.splitlines(keepends=True)
      approved_lines = approved.splitlines(keepends=True)
      diff = difflib.unified_diff(
          draft_lines,
          approved_lines,
          fromfile=f"draft/{section_name}",
          tofile=f"approved/{section_name}",
          lineterm="",
      )
      return "".join(diff)
  ```
- **Similarity Ratio:**
  ```python
  matcher = difflib.SequenceMatcher(None, draft, approved)
  similarity = round(matcher.ratio(), 4)
  ```
- **Character Delta:**
  ```python
  delta = len(approved) - len(draft)
  ```

---

## 2. Relational Schema & Persistence Architecture

### `CorrectionLog` Model (`backend/app/models/correction.py`)
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from backend.app.models.project import Project

class CorrectionLog(SQLModel, table=True):
    __tablename__ = "correction_logs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    project_id: str = Field(foreign_key="projects.id", index=True)
    section_key: str = Field(index=True)
    draft_content: str
    approved_content: str
    has_changed: bool = Field(default=False, index=True)
    diff_unified: Optional[str] = None
    character_delta: int = Field(default=0)
    similarity_ratio: float = Field(default=1.0)
    created_at: str

    project: Optional["Project"] = Relationship(back_populates="correction_logs")
```

### Hook in `approve_project_brief` (`backend/app/services/workflow.py`)
Upon brief approval:
1. Parse `draft_brief` and `approved_brief`.
2. Extract the content of each of the 11 sections.
3. Compute `has_changed`, `diff_unified`, `similarity_ratio`, and `character_delta`.
4. Persist `CorrectionLog` entries within the approval transaction.

---

## 3. Evaluation Benchmark Schema (Story 14)

### Format & Fields
```json
{
  "project_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "section_key": "scope_of_work",
  "transcript_context": "Client: We specifically need SSO via Okta...",
  "initial_agent_output": "The scope includes SSO via Google Workspace.",
  "human_corrected_output": "The scope includes SSO via Okta SAML 2.0.",
  "has_changed": true,
  "similarity_ratio": 0.74,
  "diff_unified": "--- draft/scope_of_work\n+++ approved/scope_of_work\n@@ ...",
  "created_at": "2026-09-09T10:00:00Z"
}
```

---

## 4. API & CLI Architecture

### REST Endpoints (`backend/app/api/eval.py`)
- `GET /api/v1/eval/corrections`: Returns list of `CorrectionLog` objects (supports `project_id`, `changed_only` filtering).
- `GET /api/v1/eval/export`: Returns JSON Lines (`application/x-ndjson` or `application/jsonl`) formatted for direct ingestion into LangSmith, Promptfoo, or fine-tuning pipelines.

### CLI Entrypoint (`backend/app/eval/export.py`)
- Standard Python CLI runnable via `python -m backend.app.eval.export --output benchmark.jsonl --changed-only`.
- Queries the database using SQLModel engine and writes line-delimited JSON.

---

## 5. Verification Strategy
- Unit test for diff computation logic (`compute_section_diffs`).
- Workflow test verifying `POST /api/v1/projects/{id}/approve` populates `correction_logs` table.
- API test verifying `GET /api/v1/eval/corrections` and `GET /api/v1/eval/export`.
- CLI execution test verifying `python -m backend.app.eval.export` produces valid JSONL.
