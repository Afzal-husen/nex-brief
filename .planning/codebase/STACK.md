# Technology Stack

**Analysis Date:** 2026-09-09

## Languages

**Primary:**
- TypeScript 5.x - Frontend application code, types, and Next.js configuration (`frontend/`)
- Python 3.14 - Backend application code and service logic (`backend/`)

**Secondary:**
- JavaScript (ES modules) - Tooling and configuration files (`frontend/eslint.config.mjs`, `frontend/postcss.config.mjs`)
- CSS - Styling and Tailwind CSS theme definitions (`frontend/src/app/globals.css`)

## Runtime

**Environment:**
- Node.js (v20+ recommended) - Frontend development and build runtime
- Python 3.14 runtime with virtual environment (`backend/.venv`)
- Browser runtime - Modern evergreen browsers (Chrome, Firefox, Safari, Edge)

**Package Managers:**
- Frontend: `npm` (with `frontend/package-lock.json` lockfile present)
- Backend: `pip` / PEP 517 build tooling configured via `backend/pyproject.toml`

## Frameworks

**Core:**
- Next.js 16.3.4 - React full-stack framework utilizing App Router (`frontend/src/app/`)
- React 19.2.8 & React DOM 19.2.8 - Component library with concurrent features
- React Compiler (`babel-plugin-react-compiler` 1.0.0 via `reactCompiler: true` in `frontend/next.config.ts`)

**Styling & UI:**
- Tailwind CSS v4 (`tailwindcss` 4.x, `@tailwindcss/postcss` 4.x) - Utility-first styling engine
- PostCSS (`frontend/postcss.config.mjs`)

**Testing:**
- Not yet configured (pending setup in both `frontend` and `backend`)

**Build/Dev:**
- TypeScript compiler (`tsc` 5.x) with strict type checking
- ESLint 9 (`frontend/eslint.config.mjs`) with `eslint-config-next` 16.3.4 (Core Web Vitals & TypeScript configs)

## Key Dependencies

**Critical:**
- `next` (16.3.4) - App routing, server components, and asset pipeline
- `react` / `react-dom` (19.2.8) - Core UI library
- `tailwindcss` (4.x) - Modern CSS engine and design utilities

**Infrastructure:**
- `backend/pyproject.toml` - Project specification for backend services
- `frontend/next.config.ts` - Next.js compiler and feature flag configuration

## Configuration

**Environment:**
- Frontend: Next.js standard environment management (`.env.local`, `.env.production`)
- Backend: Python environment variables / `.env` support to be configured

**Build:**
- `frontend/tsconfig.json` - Path alias `@/*` -> `./src/*`, strict mode enabled, Next.js plugin configured
- `frontend/next.config.ts` - React compiler flag enabled
- `frontend/postcss.config.mjs` - PostCSS plugin integration
- `frontend/eslint.config.mjs` - ESLint 9 flat config ignoring `.next/**`, `out/**`, `build/**`
- `backend/pyproject.toml` - Project metadata requiring Python >=3.14
- `backend/.python-version` - Locks local Python version to 3.14

## Platform Requirements

**Development:**
- Cross-platform: Windows, macOS, or Linux
- Node.js 20+ and Python 3.14+ installed
- Git version control

**Production:**
- Frontend: Vercel, Node.js server, or containerized Node environment
- Backend: ASGI/WSGI Python runtime (e.g., FastAPI/Uvicorn, Flask, or background worker) or containerized deployment

---

*Stack analysis: 2026-09-09*
*Update after major dependency changes*
