<!-- GSD:project-start source:PROJECT.md -->

## Project

**NexBrief**

NexBrief is an AI-powered assistant that transforms client discovery-call transcripts into clear, structured, and trustworthy project briefs. Instead of merely summarizing conversations, NexBrief serves as an epistemic partner that clearly separates what the client explicitly stated from what the AI inferred, identifies contradictions and missing information, suggests follow-up questions, and synthesizes a comprehensive brief with human approval at every step.

**Core Value:** Turn unstructured discovery transcripts into verifiable, grounded project briefs where every fact is anchored to client statements, inferences are transparently labeled, and the user retains complete editorial authority.

### Constraints

- **Tech Stack**: Python 3.14, FastAPI, SQLModel (SQLite), LangChain/LangGraph, Groq API, Next.js 16, TypeScript, Tailwind CSS v4.
- **LLM Provider**: Groq via `langchain-groq` for ultra-low latency generation.
- **Grounding**: All extracted facts must link to verbatim quote excerpts from the source transcript.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.x - Frontend application code, types, and Next.js configuration (`frontend/`)
- Python 3.14 - Backend application code and service logic (`backend/`)
- JavaScript (ES modules) - Tooling and configuration files (`frontend/eslint.config.mjs`, `frontend/postcss.config.mjs`)
- CSS - Styling and Tailwind CSS theme definitions (`frontend/src/app/globals.css`)

## Runtime

- Node.js (v20+ recommended) - Frontend development and build runtime
- Python 3.14 runtime with virtual environment (`backend/.venv`)
- Browser runtime - Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Frontend: `npm` (with `frontend/package-lock.json` lockfile present)
- Backend: `pip` / PEP 517 build tooling configured via `backend/pyproject.toml`

## Frameworks

- Next.js 16.3.4 - React full-stack framework utilizing App Router (`frontend/src/app/`)
- React 19.2.8 & React DOM 19.2.8 - Component library with concurrent features
- React Compiler (`babel-plugin-react-compiler` 1.0.0 via `reactCompiler: true` in `frontend/next.config.ts`)
- Tailwind CSS v4 (`tailwindcss` 4.x, `@tailwindcss/postcss` 4.x) - Utility-first styling engine
- PostCSS (`frontend/postcss.config.mjs`)
- Not yet configured (pending setup in both `frontend` and `backend`)
- TypeScript compiler (`tsc` 5.x) with strict type checking
- ESLint 9 (`frontend/eslint.config.mjs`) with `eslint-config-next` 16.3.4 (Core Web Vitals & TypeScript configs)

## Key Dependencies

- `next` (16.3.4) - App routing, server components, and asset pipeline
- `react` / `react-dom` (19.2.8) - Core UI library
- `tailwindcss` (4.x) - Modern CSS engine and design utilities
- `backend/pyproject.toml` - Project specification for backend services
- `frontend/next.config.ts` - Next.js compiler and feature flag configuration

## Configuration

- Frontend: Next.js standard environment management (`.env.local`, `.env.production`)
- Backend: Python environment variables / `.env` support to be configured
- `frontend/tsconfig.json` - Path alias `@/*` -> `./src/*`, strict mode enabled, Next.js plugin configured
- `frontend/next.config.ts` - React compiler flag enabled
- `frontend/postcss.config.mjs` - PostCSS plugin integration
- `frontend/eslint.config.mjs` - ESLint 9 flat config ignoring `.next/**`, `out/**`, `build/**`
- `backend/pyproject.toml` - Project metadata requiring Python >=3.14
- `backend/.python-version` - Locks local Python version to 3.14

## Platform Requirements

- Cross-platform: Windows, macOS, or Linux
- Node.js 20+ and Python 3.14+ installed
- Git version control
- Frontend: Vercel, Node.js server, or containerized Node environment
- Backend: ASGI/WSGI Python runtime (e.g., FastAPI/Uvicorn, Flask, or background worker) or containerized deployment

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Components: `PascalCase` for React functional components (e.g., `export default function Home()`).
- File names: Next.js standard conventions for routes (`page.tsx`, `layout.tsx`, `globals.css`).
- Variable and function names: `camelCase` (e.g., `eslintConfig`, `nextConfig`).
- Types and Interfaces: `PascalCase` (e.g., `NextConfig` imported from `next`).
- Path aliases: `@/*` mapped to `src/*` (e.g., `@/components/Button`).
- Function names: `snake_case` (e.g., `def main():`).
- Variable names: `snake_case`.
- Constants: `UPPER_SNAKE_CASE`.
- Classes: `PascalCase` (standard PEP 8).
- Modules and file names: `snake_case.py`.

## Code Style & Formatting

- TypeScript strict mode enforced (`"strict": true` in `frontend/tsconfig.json`).
- ESLint 9 configured via `frontend/eslint.config.mjs` extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Double quotes preferred in JSON and standard TS configs.
- Tailwind CSS v4 utility classes used for styling in JSX elements.
- PEP 8 compliant formatting.
- Standard entry point guard: `if __name__ == "__main__": main()`.

## Import Organization

## Error Handling

- React functional component boundaries.
- Future API requests should wrap `fetch` in `try / catch` blocks and return structured error states.
- Python standard exceptions (`try ... except Exception as e:`).
- Anticipated API errors should return descriptive HTTP error codes (e.g., via FastAPI HTTPException).

## Logging

- `console.error` and `console.warn` for critical runtime issues in development. Avoid noisy `console.log` in production.
- Python standard `logging` module recommended for structured output rather than raw `print()` statements.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- Two independent service layers (`frontend/` and `backend/`) within a unified repository.
- Modern React Server Components architecture supported by Next.js 16 with React 19 compiler.
- Minimal Python entry point ready for API service or background processing workflows.
- Clear separation of concerns between client UI presentation and backend service capabilities.

## Layers

- Purpose: Delivers user interface, handles browser routing, client state, and responsive layouts.
- Contains:
- Depends on: Next.js 16 runtime and React 19.
- Used by: End users accessing the web application via browsers.
- Purpose: Core business logic, data processing, backend automation, and service orchestration.
- Contains:
- Depends on: Python 3.14 runtime.
- Used by: Future frontend API calls, background cron jobs, or asynchronous pipelines.

## Data Flow

## Key Abstractions

- `@/*` mapped to `./src/*` in `frontend/tsconfig.json` for clean, modular imports across components and utilities.
- Frontend Web App: `frontend/src/app/page.tsx` (Home page component) and `frontend/src/app/layout.tsx` (Root layout).
- Backend CLI / Process: `backend/main.py` (`if __name__ == "__main__": main()`).

## Error Handling

- Standard Next.js error boundaries (can be implemented via `error.tsx` and `not-found.tsx` in `frontend/src/app/`).
- ESLint rules enforce type checking and prevent runtime reference errors.
- Python standard exception mechanisms to be structured with try/except blocks and appropriate exception hierarchies.

## Cross-Cutting Concerns

- TypeScript static typing across the entire frontend.
- Single root Git repository tracking changes across both frontend and backend subdirectories.
- `.gitignore` configured separately in `backend/.gitignore`, `frontend/.gitignore`, and root `.gitignore`.

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| banner-design | "Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with AI-generated visuals. Actions: design, create, generate banner. Platforms: Facebook, Twitter/X, LinkedIn, YouTube, Instagram, Google Display, website hero, print. Styles: minimalist, gradient, bold typography, photo-based, illustrated, geometric, retro, glassmorphism, 3D, neon, duotone, editorial, collage. Uses ui-ux-pro-max, frontend-design, ai-artist, ai-multimodal skills." | `.agents/skills/banner-design/SKILL.md` |
| brand | Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides. | `.agents/skills/brand/SKILL.md` |
| design | "Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads." | `.agents/skills/design/SKILL.md` |
| design-system | Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations. | `.agents/skills/design-system/SKILL.md` |
| slides | Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies. | `.agents/skills/slides/SKILL.md` |
| ui-styling | Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications. | `.agents/skills/ui-styling/SKILL.md` |
| ui-ux-pro-max | "UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks." | `.agents/skills/ui-ux-pro-max/SKILL.md` |
| vercel-react-best-practices | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements. | `.agents/skills/vercel-react-best-practices/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
