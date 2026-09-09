# Architecture

**Analysis Date:** 2026-09-09

## Pattern Overview

**Overall:** Decoupled Full-Stack Monorepo (Next.js App Router Frontend + Python Microservice/Backend)

**Key Characteristics:**
- Two independent service layers (`frontend/` and `backend/`) within a unified repository.
- Modern React Server Components architecture supported by Next.js 16 with React 19 compiler.
- Minimal Python entry point ready for API service or background processing workflows.
- Clear separation of concerns between client UI presentation and backend service capabilities.

## Layers

**Frontend Layer (`frontend/`):**
- Purpose: Delivers user interface, handles browser routing, client state, and responsive layouts.
- Contains:
  - App Router routes (`frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`).
  - Global styles and CSS design variables (`frontend/src/app/globals.css`).
  - Static visual assets (`frontend/public/`).
- Depends on: Next.js 16 runtime and React 19.
- Used by: End users accessing the web application via browsers.

**Backend Layer (`backend/`):**
- Purpose: Core business logic, data processing, backend automation, and service orchestration.
- Contains:
  - Python application entry point (`backend/main.py`).
  - Project configuration and dependency manifests (`backend/pyproject.toml`, `backend/.python-version`).
  - Dedicated virtual environment (`backend/.venv/`).
- Depends on: Python 3.14 runtime.
- Used by: Future frontend API calls, background cron jobs, or asynchronous pipelines.

## Data Flow

**Current Frontend Lifecycle:**
1. Browser requests route `/`.
2. Next.js App Router evaluates `frontend/src/app/layout.tsx` (applies fonts and global stylesheet `frontend/src/app/globals.css`).
3. `frontend/src/app/page.tsx` renders default landing presentation.
4. Static assets (SVGs) served directly from `frontend/public/`.

**Current Backend Execution:**
1. Developer runs `python backend/main.py` (or calls from active `.venv`).
2. Script invokes `main()` function.
3. Outputs diagnostic message to standard output.

**Planned Full-Stack Data Flow:**
1. Client makes HTTP/REST or WebSocket request from Next.js frontend or server action.
2. Backend API routes receive payload, validate schema, and execute domain logic.
3. Backend produces structured JSON response back to frontend.

## Key Abstractions

**Path Aliases:**
- `@/*` mapped to `./src/*` in `frontend/tsconfig.json` for clean, modular imports across components and utilities.

**Entry Points:**
- Frontend Web App: `frontend/src/app/page.tsx` (Home page component) and `frontend/src/app/layout.tsx` (Root layout).
- Backend CLI / Process: `backend/main.py` (`if __name__ == "__main__": main()`).

## Error Handling

**Frontend:**
- Standard Next.js error boundaries (can be implemented via `error.tsx` and `not-found.tsx` in `frontend/src/app/`).
- ESLint rules enforce type checking and prevent runtime reference errors.

**Backend:**
- Python standard exception mechanisms to be structured with try/except blocks and appropriate exception hierarchies.

## Cross-Cutting Concerns

- TypeScript static typing across the entire frontend.
- Single root Git repository tracking changes across both frontend and backend subdirectories.
- `.gitignore` configured separately in `backend/.gitignore`, `frontend/.gitignore`, and root `.gitignore`.

---

*Architecture analysis: 2026-09-09*
*Update as architectural layers and communication contracts are established*
