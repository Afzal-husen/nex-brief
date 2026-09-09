# Phase 1: Backend Foundation & Persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 1-Backend Foundation & Persistence
**Areas discussed:** Database Engine & Schema Lifecycle, Transcript Ingestion & Storage Model, API Route Structure & CORS Policy

---

## Database Engine & Schema Lifecycle

| Option | Description | Selected |
|--------|-------------|----------|
| `backend/data/nexbrief.db` | Dedicated data directory inside backend (gitignored) | ✓ |
| `backend/nexbrief.db` | Root of backend directory | |

**User's choice:** `backend/data/nexbrief.db`
**Notes:** Keeps database artifacts isolated in a dedicated storage directory.

| Option | Description | Selected |
|--------|-------------|----------|
| Automatic on startup | SQLModel.metadata.create_all() in FastAPI lifespan | ✓ |
| Alembic migrations | Versioned migration scripts in backend/migrations | |

**User's choice:** Automatic on startup
**Notes:** Zero-friction table initialization for local development and rapid iteration.

| Option | Description | Selected |
|--------|-------------|----------|
| WAL Mode + 5000ms busy_timeout | Enables concurrent reads while writing | ✓ |
| Standard default journal mode | Simpler single-lock SQLite | |

**User's choice:** WAL Mode + 5000ms busy_timeout
**Notes:** Crucial for preventing database locks when async FastAPI endpoints and LangGraph nodes read/write concurrently.

| Option | Description | Selected |
|--------|-------------|----------|
| String UUIDs (uuid4) with UTC timestamps | Safe across client/graph threads | ✓ |
| Auto-incrementing integer IDs | Simpler sequential integers | |

**User's choice:** String UUIDs (uuid4) with UTC timestamps
**Notes:** Provides robust unique keys across client generation and graph execution threads.

---

## Transcript Ingestion & Storage Model

| Option | Description | Selected |
|--------|-------------|----------|
| Dual storage: raw_text and normalized_text | Preserves original input while providing clean text for LLM extraction | ✓ |
| Single field: store only normalized_text | Simpler schema, saves space | |

**User's choice:** Dual storage (`raw_text` and `normalized_text`)
**Notes:** Allows lossless comparison, quote verification against original text, and sanitized parsing for the LLM.

| Option | Description | Selected |
|--------|-------------|----------|
| Plain text & Markdown with speaker markers preserved | Preserves dialog turns ("Speaker:", "Client:") | ✓ |
| Unstructured plain text only | Strips speaker indicators | |

**User's choice:** Plain text & Markdown with speaker markers preserved
**Notes:** Essential to avoid conflating interviewer questions with client statements.

| Option | Description | Selected |
|--------|-------------|----------|
| Up to 100,000 characters (~20,000 words) | Covers full 60-min discovery calls | ✓ |
| Up to 30,000 characters (~5,000-6,000 words) | Covers short calls only | |

**User's choice:** Up to 100,000 characters
**Notes:** Accommodates realistic long transcripts without arbitrary truncation.

| Option | Description | Selected |
|--------|-------------|----------|
| 1 primary active transcript per project for v1 | Can be replaced/updated | ✓ |
| Multiple concurrent transcripts per project | Merged multiple calls in v1 | |

**User's choice:** 1 primary active transcript per project for v1
**Notes:** Keeps the v1 workflow focused and deterministic.

---

## API Route Structure & CORS Policy

| Option | Description | Selected |
|--------|-------------|----------|
| `/api/v1/` prefix | Standard versioning pattern | ✓ |
| `/api/` prefix without versioning | Unversioned routes | |

**User's choice:** `/api/v1/` prefix
**Notes:** Allows clean API version evolution in future releases.

| Option | Description | Selected |
|--------|-------------|----------|
| Allow `http://localhost:3000` and read `CORS_ORIGINS` from `.env` | Clean dev security | ✓ |
| Allow wildcard (`*`) for all origins | Permissive local development | |

**User's choice:** Explicit localhost:3000 with `.env` override
**Notes:** Prevents security warnings while supporting local full-stack development.

| Option | Description | Selected |
|--------|-------------|----------|
| Direct Pydantic model serialization | Clean, idiomatic FastAPI responses | ✓ |
| Generic envelope wrapper `{ "data": ..., "status": "success" }` | Envelope wrapping | |

**User's choice:** Direct Pydantic model serialization
**Notes:** Produces accurate OpenAPI schemas and clean TypeScript types for frontend consumption.

| Option | Description | Selected |
|--------|-------------|----------|
| Standard HTTPException with `{"detail": "...", "code": "..."}` | Standard HTTP status codes (400, 404, 500) | ✓ |
| Custom error schema with status 200 and internal error flags | 200 OK errors | |

**User's choice:** Standard HTTPException with status codes and structured detail
**Notes:** Idiomatic REST error handling.

---

## Automated Testing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Pytest + HTTPX TestClient with in-memory SQLite fixture | Isolated, fast unit/integration testing | ✓ |
| Manual API verification only | No automated test suite | |

**User's choice:** Pytest + HTTPX TestClient with isolated in-memory test database fixture
**Notes:** Explicitly requested to ensure test-driven verification of health, project CRUD, and transcript normalization.

---

## Folded Todos

- **`setup-fastapi-langgraph-backend.md`:** Folded into Phase 1 to install backend dependencies, setup SQLite/SQLModel engine and tables, and structure the FastAPI backend service.

## the agent's Discretion

- Choice of internal directory layout for FastAPI backend (`backend/app/core`, `backend/app/models`, `backend/app/api`).
- Specific Pydantic schema validation messages and regex patterns for text normalization.

## Deferred Ideas

- None.
