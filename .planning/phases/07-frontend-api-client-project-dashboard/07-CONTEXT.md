# Phase 7: Frontend API Client & Project Dashboard - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 delivers the frontend API client infrastructure, typed data models, backend communication layer, and the core project management dashboard (`UI-01`). Users can connect to the FastAPI backend, view projects in a responsive dashboard, track their epistemic processing statuses with live updates, and create/delete projects.

*Note:* Transcript ingestion and epistemic fact/quote highlighting are deferred to Phase 8 (`UI-02`, `UI-03`). Interactive gap clarification is Phase 9 (`UI-04`), and brief markdown editing/approval is Phase 10 (`UI-05`).

</domain>

<decisions>
## Implementation Decisions

### Visual Style & Theme
- **D-01:** Sleek dark-first developer/AI aesthetic (Zinc 950 `#09090b` background, Slate 800 borders, crisp foreground typography, with Emerald `#10b981` / Indigo `#6366f1` subtle accents) suited for high-precision developer tools.
- **D-02:** Use Lucide React icons (`lucide-react`) for semantic status badges, navigation, and interactive buttons.
- **D-03:** Flat 1px subtle border styling on cards (Zinc 900 surface, Zinc 800 borders, `rounded-xl`, subtle crisp border hover highlight) for fast rendering and clean information density.
- **D-04:** Fast CSS micro-interactions (150ms ease, subtle border highlight, visible accessible focus-ring, respecting `prefers-reduced-motion`).

### Dashboard Layout & Cards
- **D-05:** Responsive card grid (Bento-style layout) showcasing project title, description snippet, epistemic status badge, creation timestamp, and discrete action buttons.
- **D-06:** Semantic color-coded pill badges with animated pulsing indicator for active asynchronous graph processing:
  - `analyzing` / `synthesizing`: Indigo with pulsing indicator
  - `awaiting_clarification`: Amber/Yellow
  - `ready_for_review`: Blue
  - `approved`: Emerald
  - `created`: Slate/Neutral
- **D-07:** Primary card click opens the project pipeline view (`/projects/[id]`), while destructive actions (delete) are isolated in a discrete action menu to prevent accidental navigation.
- **D-08:** Header metrics bar displaying summary pills (Total Projects, In Progress, Needs Clarification, Approved) + search filter, paired with an illustrated, guided empty state when zero projects exist ("Create your first project").

### Project Creation & Management UX
- **D-09:** Accessible Modal Dialog with backdrop blur, autofocus on project title input, client-side validation, and automatic navigation to the project page upon successful creation.
- **D-10:** Focused creation modal containing Project Title (required) and Description (optional). Transcript paste/upload is intentionally separated into the Phase 8 project detail view.
- **D-11:** Custom accessible confirmation dialog for project deletion displaying project name, warning that all associated transcripts, checkpoints, and briefs will be permanently deleted, with a red destructive action button.
- **D-12:** Toast notification system (bottom-right, auto-dismissing for successful operations, persistent with retry capability for API/network failures) complemented by inline form validation errors.

### Data Fetching & Refresh Strategy
- **D-13:** SWR library (`swr`) used for client-side data fetching with stale-while-revalidate caching, automatic deduplication, and optimistic mutation support.
- **D-14:** Smart conditional polling: 2.5s polling interval when any project is actively processing (`analyzing` or `synthesizing`), slowing to passive revalidation on window focus when projects are in resting states.
- **D-15:** Centralized typed API client module in `frontend/src/lib/api/` with `NEXT_PUBLIC_API_URL` configuration (defaulting to `http://localhost:8000/api/v1`), structured `ApiError` class, and namespace methods (`api.projects.list`, `api.projects.create`, `api.projects.delete`, `api.projects.get`).
- **D-16:** Silent health check: no persistent top navbar pill; connection errors and API outages are surfaced cleanly via actionable toast notifications when requests fail.

### the agent's Discretion
- Exact layout spacing and Tailwind utility configurations adhering to `ui-styling` and `ui-ux-pro-max` design systems.
- Next.js 16 App Router folder structure (`app/page.tsx`, `app/projects/[id]/page.tsx`, `components/dashboard/`, `components/ui/`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Specifications & Contracts
- `backend/app/models/project.py` — Project & ProjectStatus SQLModel definitions, schema contracts
- `backend/app/api/projects.py` — REST API endpoints (`GET /api/v1/projects`, `POST /api/v1/projects`, `DELETE /api/v1/projects/{id}`)
- `backend/app/api/workflow.py` — Graph execution trigger endpoints and status lifecycle
- `.planning/REQUIREMENTS.md` §UI-01 — Core user requirement for project dashboard and status tracking

### Frontend Architecture & UI Design Guidelines
- `.agents/skills/vercel-react-best-practices/SKILL.md` — Eliminating waterfalls, client-side data fetching with SWR, bundle optimization
- `.agents/skills/ui-styling/SKILL.md` — Tailwind CSS v4 styling, component patterns, accessible modals and dialogs
- `.agents/skills/ui-ux-pro-max/SKILL.md` — Dark mode UI tokens, typography, status badges, WCAG 4.5:1 contrast, micro-interactions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/app/globals.css`: Tailwind CSS v4 `@import "tailwindcss";` setup with Geist font variables.
- `frontend/src/app/layout.tsx`: Root layout with `Geist` and `Geist_Mono` Google font integration.
- `frontend/package.json`: Next.js 16.3.4, React 19.2.8, Tailwind CSS v4.

### Established Patterns
- FastAPI REST API prefix: `/api/v1`
- Project statuses: `created`, `analyzing`, `awaiting_clarification`, `synthesizing`, `ready_for_review`, `approved`
- Date formatting: ISO 8601 strings from FastAPI backend (`created_at`, `updated_at`)

### Integration Points
- `GET /api/v1/projects`: List projects
- `POST /api/v1/projects`: Create project (`title`, `description`)
- `GET /api/v1/projects/{id}`: Fetch single project
- `DELETE /api/v1/projects/{id}`: Delete project and cascade records
- `GET /api/v1/health`: Health check probe

</code_context>

<specifics>
## Specific Ideas
- Clean, dark developer-grade aesthetic similar to Linear, Vercel, and Supabase dashboards.
- Cards feature status indicators that feel alive (subtle pulsing dot when an analysis is in flight).
- Modal creation is quick and lightweight, taking user directly into the project workspace.

</specifics>

<deferred>
## Deferred Ideas

- **Transcript Ingestion UI (`UI-02`, `UI-03`)**: Belongs in Phase 8.
- **Clarification Review UI (`UI-04`)**: Belongs in Phase 9.
- **Brief Editor & Approval UI (`UI-05`)**: Belongs in Phase 10.
- **Project Export & Notion Sync**: Deferred to v2 roadmap (`EXT-02`).

</deferred>

---

*Phase: 7-frontend-api-client-project-dashboard*
*Context gathered: 2026-09-09*
