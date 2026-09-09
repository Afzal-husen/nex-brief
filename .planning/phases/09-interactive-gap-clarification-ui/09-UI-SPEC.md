---
phase: "9"
slug: "interactive-gap-clarification-ui"
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-09"
---

# Phase 9 — UI Design Contract

> Visual and interaction contract for frontend Phase 9: Interactive Gap Clarification UI (`UI-04`).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | Custom Tailwind CSS v4 accessible components |
| Icon library | lucide-react |
| Font | Geist Sans, Geist Mono |

---

## Component Inventory

| Component | Import path | Notes |
|-----------|-------------|-------|
| Button | `@/components/ui/Button` | Primary, secondary, outline, ghost, danger action buttons |
| Badge | `@/components/ui/Badge` | Status, severity, and category tags |
| Card | `@/components/ui/Card` | 1px border Zinc 900 cards |
| Toast | `@/components/ui/Toast` | Operation confirmation and error feedback toasts |
| Skeleton | `@/components/ui/Skeleton` | Loading placeholders |
| ContradictionResolverCard | `@/components/clarification/ContradictionResolverCard` | 1-Click choice cards (Claim A, Claim B, Reconcile) with editable resolution textarea |
| UnknownGapQuestionCard | `@/components/clarification/UnknownGapQuestionCard` | Suggested option chips and custom answer input with skip action |
| TranscriptContextDrawer | `@/components/clarification/TranscriptContextDrawer` | Slide-over drawer displaying surrounding transcript lines for grounded decisions |
| ClarificationProgressHeader | `@/components/clarification/ClarificationProgressHeader` | Sticky header with breadcrumbs, progress meter, and status pills |
| ClarificationActionBar | `@/components/clarification/ClarificationActionBar` | Sticky bottom bar showing item counts and "Trigger Brief Synthesis" action |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, badge tags, inline chips |
| sm | 8px | Button padding, option chip margins |
| md | 16px | Card internal padding, form element spacing |
| lg | 24px | Section gaps, questionnaire spacing |
| xl | 32px | Column gutters, major layout dividers |
| 2xl | 48px | Page margins and container padding |

---

## Color Palette (Zinc Dark First)

| Role | Tailwind Class | Hex / HSL | Usage |
|------|----------------|-----------|-------|
| Base Background | `bg-zinc-950` | `#09090b` | Page root background |
| Surface Background | `bg-zinc-900` | `#18181b` | Question and claim cards |
| Raised Background | `bg-zinc-850` / `bg-zinc-900/90` | `#202024` | Context drawer, sticky header & footer |
| Border Subdued | `border-zinc-800` | `#27272a` | Card boundaries, dividers |
| Border Highlight | `border-zinc-700` | `#3f3f46` | Interactive hover states |
| Primary Accent | `bg-indigo-600` / `text-indigo-400` | `#4f46e5` | Primary CTA, focus rings, active chips |
| Contradiction Tension | `text-amber-300` / `bg-amber-500/15` | `#f59e0b` | Contradiction alerts & tension pills |
| Critical Conflict | `text-rose-300` / `bg-rose-500/15` | `#f43f5e` | Direct conflict & high impact gaps |
| Verified Grounding | `text-emerald-300` / `bg-emerald-500/15` | `#10b981` | Resolved badges, quote highlights |
| Unknown Gap | `text-sky-300` / `bg-sky-500/15` | `#0ea5e9` | Follow-up questions & suggestion chips |

---

## Typography Hierarchy

| Level | Size / Weight | Tracking | Usage |
|-------|---------------|----------|-------|
| H1 | 24px (text-2xl) / Bold | -0.02em | Page title ("Clarify Project Gaps") |
| H2 | 16px (text-base) / Semibold | -0.01em | Question statement / Contradiction title |
| Body | 14px (text-sm) / Regular | Normal | Conflict rationale, question details |
| Monospace Quotes | 12px (text-xs) / font-mono | Normal | Verbatim transcript excerpts |
| Metadata Pills | 11px (text-[11px]) / Medium | +0.02em | Categories, speaker attribution, skip flags |

---

## Interactive States & Animations

1. **Choice Cards (Claim A / Claim B / Reconcile)**:
   - Unselected: `bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300`
   - Selected: `bg-indigo-500/15 border-2 border-indigo-500 text-indigo-100 shadow-[0_0_12px_rgba(99,102,241,0.2)]`
   - Smooth 150ms transition.

2. **Suggested Option Chips**:
   - `px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all`
   - Hover: `bg-zinc-800 text-zinc-100`
   - Active/Selected: `bg-sky-500/20 text-sky-200 border border-sky-500/40`

3. **Transcript Context Drawer**:
   - Slides in from right on desktop (width: 440px) or bottom sheet on mobile.
   - Backdrop overlay `bg-black/60 backdrop-blur-xs` with escape key dismissal.
   - Highlights the target quotation lines with soft emerald background and line markers.

4. **Progress Meter & Unlock Trigger**:
   - Live counter: `{resolvedCount} of {totalCount} resolved • {remainingHighSeverity} critical remaining`.
   - "Trigger Brief Synthesis" button:
     - Disabled with tooltip while critical items remain unreviewed.
     - Pulsing indigo gradient once unlocked: `from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25`.
