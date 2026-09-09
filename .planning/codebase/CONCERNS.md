# Codebase Concerns

**Analysis Date:** 2026-09-09

## Tech Debt

**Python Version Compatibility:**
- Issue: `backend/pyproject.toml` specifies `requires-python = ">=3.14"` and `backend/.python-version` is set to `3.14`.
- Why: Python 3.14 is currently in pre-release/alpha/beta development stage and may have limited pre-compiled wheel compatibility for popular libraries (e.g., NumPy, Pydantic, Pandas, etc.).
- Impact: Attempting to install certain binary-dependent packages could fail to compile on Windows without a complete C/C++ build toolchain.
- Fix approach: Verify Python 3.14 wheel availability for prospective backend packages; if build issues arise, adjust `pyproject.toml` to `>=3.11` or `>=3.12` for stable ecosystem support.

**Decoupled Frontend / Backend Orchestration:**
- Issue: Currently there is no unified root dev script or docker-compose file to spin up both `frontend` and `backend` simultaneously.
- Why: Fresh project scaffolding.
- Impact: Developers must open separate terminals and run manual start commands for each service.
- Fix approach: Introduce a monorepo task runner (such as `concurrently`, `turbo`, or a root `Makefile` / PowerShell task).

## Known Bugs

- None detected in existing clean boilerplate.

## Security Considerations

**API CORS and Network Boundaries:**
- Risk: When the frontend and backend communicate in local development (e.g., localhost:3000 -> localhost:8000), cross-origin requests must be handled safely without wildcards (`*`) in production.
- Current mitigation: Not yet connected.
- Recommendations: Implement strict CORS origins and environment-specific headers upon API creation.

**Environment Variables & Secrets:**
- Risk: Accidental commitment of API keys, database credentials, or secret tokens.
- Current mitigation: Both `backend/.gitignore` and `frontend/.gitignore` ignore `.env` files.
- Recommendations: Maintain `.env.example` templates and never commit secret values.

## Performance Bottlenecks

- Currently minimal. Next.js 16 compiler optimization (`reactCompiler: true`) is enabled for optimized React component rendering.

## Fragile Areas

**Full-Stack Interface Contract:**
- Why fragile: No shared type generation exists between the Python backend models and the Next.js TypeScript frontend interfaces.
- Common failures: Backend field renaming causes silent frontend runtime undefined errors.
- Safe modification: Adopt OpenAPI schema generation (e.g., via FastAPI) with automated TypeScript client generation (e.g., `openapi-typescript` or `orval`).

## Scaling Limits

- Currently in initial skeleton state. No capacity limits identified.

---

*Concerns analysis: 2026-09-09*
*Update as issues, technical debt, or architectural bottlenecks arise*
