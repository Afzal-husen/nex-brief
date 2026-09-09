# Coding Conventions

**Analysis Date:** 2026-09-09

## Naming Patterns

**TypeScript / React (`frontend/`):**
- Components: `PascalCase` for React functional components (e.g., `export default function Home()`).
- File names: Next.js standard conventions for routes (`page.tsx`, `layout.tsx`, `globals.css`).
- Variable and function names: `camelCase` (e.g., `eslintConfig`, `nextConfig`).
- Types and Interfaces: `PascalCase` (e.g., `NextConfig` imported from `next`).
- Path aliases: `@/*` mapped to `src/*` (e.g., `@/components/Button`).

**Python (`backend/`):**
- Function names: `snake_case` (e.g., `def main():`).
- Variable names: `snake_case`.
- Constants: `UPPER_SNAKE_CASE`.
- Classes: `PascalCase` (standard PEP 8).
- Modules and file names: `snake_case.py`.

## Code Style & Formatting

**Frontend:**
- TypeScript strict mode enforced (`"strict": true` in `frontend/tsconfig.json`).
- ESLint 9 configured via `frontend/eslint.config.mjs` extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Double quotes preferred in JSON and standard TS configs.
- Tailwind CSS v4 utility classes used for styling in JSX elements.

**Backend:**
- PEP 8 compliant formatting.
- Standard entry point guard: `if __name__ == "__main__": main()`.

## Import Organization

**Frontend:**
1. External core framework packages (e.g., `import Image from "next/image"`, `import type { NextConfig } from "next"`).
2. Third-party UI/utility libraries.
3. Internal alias imports (`@/components/...`, `@/lib/...`).
4. Relative imports (`./globals.css`).
5. Type imports explicitly marked (`import type { ... } from "..."`).

**Backend:**
1. Standard library imports (e.g., `sys`, `os`, `pathlib`).
2. Third-party packages.
3. Local application imports.

## Error Handling

**Frontend:**
- React functional component boundaries.
- Future API requests should wrap `fetch` in `try / catch` blocks and return structured error states.

**Backend:**
- Python standard exceptions (`try ... except Exception as e:`).
- Anticipated API errors should return descriptive HTTP error codes (e.g., via FastAPI HTTPException).

## Logging

**Frontend:**
- `console.error` and `console.warn` for critical runtime issues in development. Avoid noisy `console.log` in production.

**Backend:**
- Python standard `logging` module recommended for structured output rather than raw `print()` statements.

---

*Conventions analysis: 2026-09-09*
*Update as team conventions or linter rules evolve*
