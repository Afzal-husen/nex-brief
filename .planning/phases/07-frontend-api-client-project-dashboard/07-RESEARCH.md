# Phase 7: Frontend API Client & Project Dashboard - Research

**Date:** 2026-09-09
**Status:** Complete

## Technical Analysis

### 1. Backend REST API Contracts

The FastAPI backend exposes endpoints rooted at `/api/v1`:

| Endpoint | Method | Request Payload | Response Model | Description |
|----------|--------|-----------------|----------------|-------------|
| `/api/v1/health` | GET | None | `{"status": "ok", "app": "nex-brief"}` | Health probe |
| `/api/v1/projects` | GET | None | `list[ProjectRead]` | List all projects |
| `/api/v1/projects` | POST | `{"title": str, "description": Optional[str]}` | `ProjectRead` | Create new project |
| `/api/v1/projects/{id}` | GET | None | `ProjectRead` | Get project by ID |
| `/api/v1/projects/{id}` | DELETE | None | `{"status": "deleted", "id": str}` | Delete project |

#### TypeScript Data Types
```typescript
export type ProjectStatus =
  | 'created'
  | 'analyzing'
  | 'awaiting_clarification'
  | 'synthesizing'
  | 'ready_for_review'
  | 'approved';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreatePayload {
  title: string;
  description?: string | null;
}
```

### 2. Frontend Dependencies & Tooling

- Next.js 16.3.4 (App Router)
- React 19.2.8 & React DOM 19.2.8
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `swr` (installed): stale-while-revalidate data fetching with mutation & conditional polling
- `lucide-react` (installed): tree-shakeable SVG icons

### 3. Vercel React Best Practices Integration

- **Eliminating Waterfalls (`async-parallel`, `async-suspense-boundaries`)**: Initial dashboard layout mounts with instant skeleton states; SWR handles data fetching without blocking root layout.
- **Bundle Size Optimization (`bundle-barrel-imports`, `bundle-analyzable-paths`)**: Direct imports for UI components; direct Lucide icon imports (`import { Plus, Trash2 } from 'lucide-react'`).
- **Client-Side Data Fetching (`client-swr-dedup`)**: Centralized `apiClient` fetcher function; SWR hook with `refreshInterval` dynamically calculated based on whether any project is in `analyzing` or `synthesizing` state.
- **Re-render Optimization**: Clean component decomposition (`ProjectCard`, `ProjectGrid`, `ProjectMetrics`, `CreateProjectModal`, `DeleteProjectModal`).

### 4. UI/UX Pro Max Design System & Tokens

- **Palette**:
  - Background: `bg-zinc-950` (`#09090b`)
  - Surface/Card: `bg-zinc-900` (`#18181b`)
  - Border: `border-zinc-800` (`#27272a`)
  - Foreground Text: `text-zinc-100` (`#f4f4f5`)
  - Muted Text: `text-zinc-400` (`#a1a1aa`)
  - Status Indicators:
    - `created`: `bg-zinc-800 text-zinc-300 border-zinc-700`
    - `analyzing` / `synthesizing`: `bg-indigo-500/10 text-indigo-400 border-indigo-500/20` (with pulsing dot)
    - `awaiting_clarification`: `bg-amber-500/10 text-amber-400 border-amber-500/20`
    - `ready_for_review`: `bg-blue-500/10 text-blue-400 border-blue-500/20`
    - `approved`: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- **Typography**: Geist Sans via `var(--font-geist-sans)` and Geist Mono via `var(--font-geist-mono)`.
- **Accessibility**: Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`), WCAG 4.5:1 text contrast, accessible dialog with keyboard Escape and overlay click handlers.

### 5. Plan Structure

- **07-01-PLAN.md**: Typed API Client, Error Handling, SWR Hooks, Toast System, and UI Primitives (`Button`, `Badge`, `Card`, `Modal`, `Skeleton`, `Toast`).
- **07-02-PLAN.md**: Project Dashboard Page, Bento Card Grid, Metric Summary Pills, Search Filter, Create Project Modal, Delete Confirmation Dialog, Empty State, and Project Pipeline Route Scaffold (`/projects/[id]`).
