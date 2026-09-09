# Phase 7: Frontend API Client & Project Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 7-Frontend API Client & Project Dashboard
**Areas discussed:** Visual Style & Theme, Dashboard Layout & Cards, Project Creation & Management UX, Data Fetching & Refresh Strategy

---

## Visual Style & Theme

| Option | Description | Selected |
|--------|-------------|----------|
| Dark-first theme | Zinc 950 background, Slate 800 borders, crisp text, Emerald/Indigo subtle accents suited for developer/AI tools | ✓ |
| Clean Light-first theme | White/Slate 50 background, crisp borders, Teal primary accents | |
| Dual theme with toggle | Defaults to system preference, supports both Light and Dark via CSS variables | |

| Option | Description | Selected |
|--------|-------------|----------|
| Lucide React icons | Lucide React icons with Emerald (#10b981) / Indigo (#6366f1) accents for status and grounding indicators | ✓ |
| Minimal inline SVG | Minimal inline SVG icons with monochrome slate accents | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sleek flat border style | Zinc 900 cards, 1px subtle Zinc 800 border, rounded-xl, crisp hover highlight | ✓ |
| Subtle glassmorphism | Semi-transparent zinc background, backdrop-blur-md, faint gradient border glow | |

| Option | Description | Selected |
|--------|-------------|----------|
| Fast CSS micro-interactions | 150ms ease, subtle border highlight, visible focus-ring, respecting prefers-reduced-motion | ✓ |
| Animated transitions | Subtle scale-up (hover:scale-[1.01]) and fade-ins | |

---

## Dashboard Layout & Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Responsive card grid | Bento-style card grid with project title, description snippet, epistemic status badge, created date, and quick action menu | ✓ |
| Switchable view | Toggle between Card Grid and Compact Data Table | |
| Dense data table | Sortable columns and inline status tags | |

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic color-coded pill badges | Animated pulsing indicator for active states (Analyzing / Synthesizing in Indigo, Awaiting Clarification in Amber, Ready in Blue, Approved in Emerald) | ✓ |
| Subtle monochrome badges | Distinct Lucide icon prefixes for each status | |

| Option | Description | Selected |
|--------|-------------|----------|
| Whole card clickable | Opens project pipeline (/projects/{id}), with a 3-dot dropdown or discrete button for Delete/Actions to prevent accidental navigation | ✓ |
| Explicit 'Open Project' button | Card body purely informational | |

| Option | Description | Selected |
|--------|-------------|----------|
| Top metric summary pills | Total, In Progress, Needs Clarification, Approved + searchable header, with an illustrated, guided empty state containing a 'Create your first project' CTA | ✓ |
| Minimalist header | Just search input and '+ New Project' button; simple text empty state | |

---

## Project Creation & Management UX

| Option | Description | Selected |
|--------|-------------|----------|
| Accessible Modal Dialog | Backdrop blur, autofocus on title, validation, and auto-navigation to the project view on creation | ✓ |
| Right-side slide-over Drawer | Keeping dashboard visible in the background | |
| Dedicated full page route | /projects/new | |

| Option | Description | Selected |
|--------|-------------|----------|
| Focused creation modal | Title & optional Description in modal; once created, immediately routes to project page for transcript ingestion (Phase 8 separation) | ✓ |
| Two-step wizard | Title/Description -> Optional transcript paste immediately | |

| Option | Description | Selected |
|--------|-------------|----------|
| Custom accessible confirmation dialog | Project name confirmation, warning that all transcripts/briefs will be deleted, and red destructive button | ✓ |
| Two-click inline confirmation | On the card ('Delete' -> 'Click again to confirm') | |

| Option | Description | Selected |
|--------|-------------|----------|
| Toast notifications | Bottom-right, auto-dismiss for success, persistent for API errors with retry option + inline validation errors in form inputs | ✓ |
| Inline banner alerts | Top of dashboard/modal only | |

---

## Data Fetching & Refresh Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| SWR library | `import useSWR from 'swr'` for stale-while-revalidate caching and mutation | ✓ |
| Custom typed hooks | Zero extra bundle bloat, native fetch, AbortController | |
| Server Components | Server Actions and router.refresh() | |

| Option | Description | Selected |
|--------|-------------|----------|
| Smart conditional polling | Fast 2.5s interval when any project is in an active state ('analyzing' or 'synthesizing'), slowing to passive on-focus revalidation when resting | ✓ |
| Fixed interval polling | Poll every 5s continuously across dashboard | |
| Manual refresh button only | No background polling | |

| Option | Description | Selected |
|--------|-------------|----------|
| Centralized typed API module | `frontend/src/lib/api/` with NEXT_PUBLIC_API_URL, structured ApiError class, and namespace methods | ✓ |
| Direct fetch wrapper hook | Per feature without global API client namespace | |

| Option | Description | Selected |
|--------|-------------|----------|
| Silent health check | No header pill, only display connection errors when an action actually fails | ✓ |
| Top header backend status pill | Green dot 'Backend Online' / pulsing amber 'Connecting' / red 'Backend Offline' | |

---

## the agent's Discretion

- Micro-component design (Card, Button, Dialog, Toast, Badge) following `ui-styling` and `ui-ux-pro-max` design systems.
- Next.js 16 App Router component code organization and strict TypeScript typing.

## Deferred Ideas

- Transcript ingestion interface (`UI-02`, `UI-03`): Phase 8
- Interactive gap clarification (`UI-04`): Phase 9
- Brief markdown editor and approval (`UI-05`): Phase 10
