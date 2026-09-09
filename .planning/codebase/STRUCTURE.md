# Codebase Structure

**Analysis Date:** 2026-09-09

## Directory Layout

```
d:/nex-brief/
├── .agents/                 # GSD framework tools, skills, agents, and workflows
│   ├── agents/              # Subagent definitions
│   ├── gsd-core/            # Core GSD scripts, templates, and workflows
│   └── skills/              # Operational skills catalog
├── .git/                    # Git repository data
├── .gitignore               # Root git ignore rules
├── backend/                 # Python backend service
│   ├── .gitignore           # Python virtualenv and cache ignore rules
│   ├── .python-version      # Python version specification (3.14)
│   ├── .venv/               # Virtual environment directory
│   ├── README.md            # Backend documentation
│   ├── main.py              # Entry point script
│   └── pyproject.toml       # Backend project dependencies and metadata
└── frontend/                # Next.js 16 + React 19 + Tailwind v4 frontend
    ├── .gitignore           # Node/Next.js ignore rules
    ├── .next/               # Next.js build cache and generated types
    ├── README.md            # Frontend documentation
    ├── eslint.config.mjs    # ESLint configuration
    ├── next-env.d.ts        # Next.js TypeScript declarations
    ├── next.config.ts       # Next.js configuration (reactCompiler: true)
    ├── node_modules/        # Frontend npm dependencies
    ├── package-lock.json    # Deterministic dependency lockfile
    ├── package.json         # Frontend npm manifest
    ├── postcss.config.mjs   # PostCSS configuration
    ├── public/              # Static public assets (SVG icons)
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    ├── src/                 # Application source code
    │   └── app/             # App Router components, layouts, and styles
    │       ├── favicon.ico
    │       ├── globals.css  # Global CSS styling
    │       ├── layout.tsx   # Root layout component
    │       └── page.tsx     # Root page component
    └── tsconfig.json        # TypeScript configuration
```

## Directory Purposes

**`backend/`:**
- Purpose: Contains Python services, business logic, data processing, and APIs.
- Contains: `main.py`, `pyproject.toml`, `.python-version`, `.venv/`.
- Key files: `backend/main.py`, `backend/pyproject.toml`.

**`frontend/`:**
- Purpose: Next.js 16 web application delivering user interface.
- Contains: `src/`, `public/`, config files, `package.json`.
- Key files: `frontend/next.config.ts`, `frontend/package.json`, `frontend/tsconfig.json`.

**`frontend/src/app/`:**
- Purpose: Next.js App Router route hierarchy and UI shell.
- Contains: React components (`page.tsx`, `layout.tsx`) and CSS (`globals.css`).
- Key files: `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`.

## Key File Locations

**Entry Points:**
- Frontend Web App: `frontend/src/app/page.tsx`
- Frontend Root Layout: `frontend/src/app/layout.tsx`
- Backend Application: `backend/main.py`

**Configuration:**
- Frontend Package Manifest: `frontend/package.json`
- Frontend TypeScript Config: `frontend/tsconfig.json`
- Next.js Configuration: `frontend/next.config.ts`
- ESLint Flat Config: `frontend/eslint.config.mjs`
- Backend Project Config: `backend/pyproject.toml`
- Backend Python Target: `backend/.python-version`

**Static Assets:**
- Frontend Public Assets: `frontend/public/`

## Naming Conventions

**Files:**
- React Components & Pages: `PascalCase.tsx` or Next.js convention files (`page.tsx`, `layout.tsx`, `error.tsx`).
- Python scripts: `snake_case.py` (e.g., `main.py`).
- Configuration files: lowercase with relevant extension (`tsconfig.json`, `eslint.config.mjs`, `pyproject.toml`).

**Directories:**
- Frontend route folders: kebab-case or Next.js route segment patterns (e.g., `[id]`, `(auth)`).
- General source directories: lowercase / kebab-case (e.g., `src/app`, `src/components`, `src/lib`).

## Where to Add New Code

**New Frontend UI Components:**
- Add to `frontend/src/components/` (create folder as needed).
- Import using `@/components/...` path alias.

**New Frontend Routes / Pages:**
- Add folder under `frontend/src/app/<route-name>/page.tsx`.

**New Backend Endpoints / Services:**
- Add modules or packages under `backend/` (e.g., `backend/routers/`, `backend/services/`, `backend/models/`).

**Shared Utilities / Types:**
- Frontend: `frontend/src/lib/` or `frontend/src/types/`.
- Backend: `backend/utils/` or `backend/core/`.

---

*Structure analysis: 2026-09-09*
*Update after directory reorganizations or significant structural additions*
