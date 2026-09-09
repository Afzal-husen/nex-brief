# Phase 1: Backend Foundation & Persistence - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the core FastAPI backend application service, SQLite database persistence with SQLModel and WAL mode, and REST endpoints for client Project management and Transcript ingestion with text normalization. (LangGraph extraction and synthesis are handled in subsequent phases.)

</domain>

<decisions>
## Implementation Decisions

### Database Engine & Schema Lifecycle
- **D-01:** Database file is located at `backend/data/nexbrief.db`. The `backend/data/` directory is dedicated to persistent local storage and added to `.gitignore`. — **Reversibility:** reversible — standard directory path.
- **D-02:** Tables and schemas are initialized automatically on FastAPI startup lifespan via `SQLModel.metadata.create_all(engine)`. — **Reversibility:** costly — changing to an Alembic migration tree later requires bootstrapping baseline migrations.
- **D-03:** SQLite engine enforces PRAGMA WAL mode (`journal_mode = WAL`) and `busy_timeout = 5000` to ensure concurrent read performance without database table lockouts during async requests. — **Reversibility:** reversible — PRAGMA configuration on connect.
- **D-04:** Primary keys use UUID4 string identifiers (`str` with `default_factory=lambda: str(uuid.uuid4())`), and records track UTC ISO timestamps (`created_at`, `updated_at`). — **Reversibility:** costly — schema primary key types touch foreign keys and API route parameters.

### Transcript Ingestion & Storage Model
- **D-05:** Transcripts use dual-field storage: storing `raw_text` (verbatim user paste/upload) and `normalized_text` (cleaned excess whitespace and normalized line breaks). — **Reversibility:** costly — altering stored text representations impacts downstream quote matching.
- **D-06:** Transcript parser preserves speaker markers (e.g. `Client:`, `Interviewer:`, `Speaker 1:`) during normalization to ensure conversational dialog turns are intact for LLM extraction. — **Reversibility:** reversible.
- **D-07:** Ingestion endpoints support up to 100,000 characters (~20,000 words, covering a full 60-minute discovery call). — **Reversibility:** reversible — validation threshold.
- **D-08:** Projects support 1 primary active transcript in v1 (updating the transcript replaces or creates a new active version for the project). — **Reversibility:** reversible — schema can expand to multi-transcript relations in v2.

### API Route Structure & CORS Policy
- **D-09:** All REST endpoints are prefixed under `/api/v1/` (e.g. `/api/v1/projects`, `/api/v1/transcripts`). — **Reversibility:** costly — touches all frontend client fetch routes.
- **D-10:** CORS middleware allows `http://localhost:3000` by default, configurable via `CORS_ORIGINS` environment variable in `.env`. — **Reversibility:** reversible.
- **D-11:** Responses serialize directly as Pydantic models (e.g. `ProjectRead`, `TranscriptRead`) without generic envelope wrappers. — **Reversibility:** costly — defines OpenAPI contract consumed by frontend client.
- **D-12:** Error responses utilize standard FastAPI `HTTPException` with structured details (`{"detail": "...", "code": "NOT_FOUND"}`) and semantic HTTP status codes (400, 404, 422, 500). — **Reversibility:** reversible.

### Folded Todos
- **Setup FastAPI, LangGraph, and Groq in Backend (`setup-fastapi-langgraph-backend.md`):** Folded into Phase 1 to install the full backend dependency footprint (`fastapi`, `uvicorn[standard]`, `sqlmodel`, `pydantic`, `python-dotenv`, `langchain`, `langgraph`, `langchain-groq`, `pytest`, `httpx`), setup the initial SQLModel tables, and establish the FastAPI project structure.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Requirements
- `docs/product_requirements.md` §1-§2 — [User Stories 1 & 2: Project creation and transcript ingestion]
- `.planning/REQUIREMENTS.md` §Data Model & Persistence — [DATA-01, DATA-02, DATA-03, INGEST-01, INGEST-02]
- `.planning/research/STACK.md` §Core Technologies & Installation — [FastAPI, SQLModel, SQLite package versions and config]
- `.planning/research/ARCHITECTURE.md` §Recommended Project Structure — [Backend directory layout and component responsibilities]
- `.planning/research/PITFALLS.md` §Pitfall 3 — [Avoiding ephemeral in-memory state and managing SQLite connections cleanly]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/pyproject.toml` — Minimal PEP 517 project definition requiring Python >=3.14. Needs dependencies added.
- `backend/.venv` — Existing virtual environment in `backend/` ready for package installation.
- `backend/main.py` — Existing boilerplate entrypoint; will be replaced by the FastAPI application factory.

### Established Patterns
- Path aliases in frontend (`@/*`); backend will adopt `app/` package pattern with modular sub-packages: `app.core`, `app.models`, `app.api`.

### Integration Points
- `/api/v1/projects` — CRUD endpoints consumed by Next.js dashboard (Phase 7).
- `/api/v1/projects/{id}/transcripts` — Ingestion endpoints consumed by Transcript UI (Phase 8).
- `backend/data/nexbrief.db` — Persistent database file consumed by downstream LangGraph state checkpointers (Phase 4).

</code_context>

<specifics>
## Specific Ideas

- Ensure `backend/data/` is added to `.gitignore` so local SQLite databases and WAL files are never committed to version control.
- Provide a clean health check route at `GET /api/v1/health` that checks database connectivity and returns `{"status": "ok", "database": "connected"}`.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed tightly within Phase 1 scope.

</deferred>

---

*Phase: 01-backend-foundation-persistence*
*Context gathered: 2026-09-09*
