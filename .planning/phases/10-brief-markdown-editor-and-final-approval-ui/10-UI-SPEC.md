---
phase: "10"
slug: "brief-markdown-editor-and-final-approval-ui"
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-09"
---

# Phase 10 — UI Design Contract

> Visual and interaction contract for frontend Phase 10: Brief Markdown Editor & Final Approval UI (`UI-05`, `BRIEF-03`, `BRIEF-04`, `EVAL-01`).

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
| BriefHeader | `@/components/brief/BriefHeader` | Sticky top workspace header with breadcrumbs, status badge, and "Review & Approve" trigger |
| BriefCritiqueBanner | `@/components/brief/BriefCritiqueBanner` | Top audit banner with circular score meter (0-100), severity count pills, and advisory summary |
| BriefSectionCard | `@/components/brief/BriefSectionCard` | 11-section card with formatted Markdown render, word count, grounded fact links, and inline edit toggle |
| BriefMarkdownEditor | `@/components/brief/BriefMarkdownEditor` | Section Markdown editor textarea with live preview, word count, and "Apply Suggested Fix" integration |
| CritiqueInlineAlert | `@/components/brief/CritiqueInlineAlert` | Warning banner on affected section with explanation and 1-click "Apply Suggested Fix" |
| BriefTableOfContents | `@/components/brief/BriefTableOfContents` | Sticky desktop sidebar / collapsible drawer for jumping between the 11 brief sections |
| ApprovalModal | `@/components/brief/ApprovalModal` | Human sign-off modal with editorial change summary, diff highlights, "Confirm Approval", and export buttons |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, badge tags, inline chips |
| sm | 8px | Button padding, section tags, small margins |
| md | 16px | Card internal padding, form element spacing |
| lg | 24px | Section gaps, header-to-body spacing |
| xl | 32px | Column gutters, major layout dividers |
| 2xl | 48px | Page margins and container padding |

---

## Color Palette (Zinc Dark First)

| Role | Tailwind Class | Hex / HSL | Usage |
|------|----------------|-----------|-------|
| Base Background | `bg-zinc-950` | `#09090b` | Page root background |
| Surface Background | `bg-zinc-900` | `#18181b` | Section cards and preview panels |
| Raised Background | `bg-zinc-850` / `bg-zinc-900/90` | `#202024` | Modal dialog, sticky header & TOC sidebar |
| Border Subdued | `border-zinc-800` | `#27272a` | Card boundaries, dividers |
| Border Highlight | `border-zinc-700` | `#3f3f46` | Interactive hover states |
| Primary Accent | `bg-indigo-600` / `text-indigo-400` | `#4f46e5` | Primary CTA, focus rings, approve buttons |
| High Score / Approved | `text-emerald-300` / `bg-emerald-500/15` | `#10b981` | Critique score >= 80, approved brief badge |
| Moderate Score / Warning | `text-amber-300` / `bg-amber-500/15` | `#f59e0b` | Critique score 60-79, advisory warnings |
| Critical Issue / Danger | `text-rose-300` / `bg-rose-500/15` | `#f43f5e` | Critique score < 60, ungrounded claim alerts |
| Info / Guidance | `text-sky-300` / `bg-sky-500/15` | `#0ea5e9` | Section number pills, suggested fix chips |

---

## Typography Hierarchy

| Level | Size / Weight | Tracking | Usage |
|-------|---------------|----------|-------|
| H1 | 24px (text-2xl) / Bold | -0.02em | Brief document title ("Project Brief") |
| H2 | 18px (text-lg) / Semibold | -0.01em | Section title (e.g. "1. Executive Summary & Client Background") |
| H3 | 14px (text-sm) / Semibold | Normal | Critique alert titles, modal subheaders |
| Prose Body | 14px (text-sm) / Regular | Normal | Rendered markdown content, lead paragraphs |
| Code / Mono | 12px (text-xs) / font-mono | Normal | Raw Markdown editor, diff changes, JSON/IDs |
| Metadata Pills | 11px (text-[11px]) / Medium | +0.02em | Word counts, section keys, severity indicators |

---

## Interactive States & Animations

1. **Section Card Transitions**:
   - Default: `border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700/80 transition-all`
   - Active Editing: `border-indigo-500/60 ring-1 ring-indigo-500/30 bg-zinc-900`
   - Modified indicator: Small emerald dot or badge `Modified by editor`

2. **Critique Inline Alerts**:
   - `p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed`
   - Ungrounded claim: `bg-rose-500/10 border-rose-500/30 text-rose-200`
   - Missing constraint / contradiction: `bg-amber-500/10 border-amber-500/30 text-amber-200`
   - "Apply Fix" button: `hover:bg-amber-500/20 text-amber-300 active:scale-95 transition-all`

3. **Approval Modal**:
   - Backdrop blur: `fixed inset-0 bg-black/70 backdrop-blur-sm z-50`
   - Modal container: `bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150`
   - Diff highlight: green highlight for added lines, red highlight for removed lines

4. **Export Dropdown / Buttons**:
   - 1-Click copy with visual checkmark feedback: "Copied to Clipboard!" for 2 seconds
   - Download triggers native `.md` file download with sanitized project name
