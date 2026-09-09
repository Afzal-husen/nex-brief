---
phase: "8"
slug: "transcript-ingestion-fact-grounding-ui"
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-09"
---

# Phase 8 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated for Phase 8: Transcript Ingestion & Fact Grounding UI.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (Custom Tailwind CSS v4 accessible components) |
| Icon library | lucide-react |
| Font | Geist Sans, Geist Mono |

---

## Component Inventory

Could not enumerate: Project uses custom modular UI primitives in `frontend/src/components/ui/` built on Tailwind CSS v4 without third-party component wrapper libraries.

| Component | Import path | Notes |
|-----------|-------------|-------|
| Button | `@/components/ui/Button` | Primary, secondary, outline, ghost, danger actions with loading state |
| Badge | `@/components/ui/Badge` | Status badges with animated pulsing state for active processing |
| Card | `@/components/ui/Card` | Flat 1px border surface card with Zinc 900 background |
| Modal | `@/components/ui/Modal` | Accessible backdrop dialog for destructive confirmations and replace prompts |
| Skeleton | `@/components/ui/Skeleton` | Content loading skeleton blocks |
| Toast | `@/components/ui/Toast` | Bottom-right operation and error feedback toasts |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding, badge tags |
| sm | 8px | Button padding, compact element spacing |
| md | 16px | Card internal padding, default element spacing |
| lg | 24px | Pane margins, section padding |
| xl | 32px | Layout gaps between split columns |
| 2xl | 48px | Header and workspace breaks |
| 3xl | 64px | Maximum page-level margins |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 (Regular) | 1.5 |
| Label | 12px | 500 (Medium) | 1.4 |
| Heading | 18px / 20px | 600 (SemiBold) | 1.3 |
| Display | 24px | 700 (Bold) | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#09090b` (Zinc 950) | Main background, full-page workspace surface |
| Secondary (30%) | `#18181b` (Zinc 900) | Card containers, transcript reader pane, fact cards, borders `#27272a` (Zinc 800) |
| Accent (10%) | `#10b981` (Emerald 500) | Confirmed fact badges, quote highlight background `rgba(16,185,129,0.18)`, border glow |
| Accent Secondary | `#6366f1` (Indigo 500) | Primary CTA buttons, analysis trigger actions, Inferred point badges |
| Warning / Gap | `#f59e0b` (Amber 500) | Unknown gap badges, contradiction highlights |
| Destructive | `#ef4444` (Red 500) | Transcript replace/reset confirmations |

Accent reserved for: Primary action buttons (`Start Epistemic Analysis`, `Save Transcript`), active quote highlight bounding boxes in transcript viewer, active filter pill indicator, and epistemic category badges.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Start Epistemic Analysis` |
| Secondary CTA | `Save Transcript` / `Replace Transcript` |
| Empty state heading | `No Transcript Ingested Yet` |
| Empty state body | `Paste discovery call notes or drop a transcript file (.txt, .md, .vtt, .srt) to extract grounded project facts.` |
| Ingestion tabs | `Paste Text` \| `Upload File` |
| Metrics preview bar | `{chars} characters • {words} words • {speakers} speakers detected` |
| Fact filter tabs | `All ({N})` \| `Confirmed Facts ({N})` \| `Inferred Points ({N})` \| `Contradictions ({N})` \| `Unknown Gaps ({N})` |
| Error state | `Failed to analyze transcript. Check backend server connection and try again.` |
| Destructive confirmation | `Replace Transcript: Uploading a new transcript will replace the existing source text and recalculate epistemic extractions. Continue?` |
| Next Phase Footer CTA | `Proceed to Clarifications ({N} items to resolve) →` |

---

## UI Considerations

Applicable state considerations resolved: 5 covered, 1 backstop, 0 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | Ingestion View | ✅ covered | Ingestion card hero rendered with clear upload dropzone and paste textarea |
| loading | Extraction Trigger | ✅ covered | CTA button enters loading state with spinning loader and disabled click guard |
| populated | Split Pane Workspace | ✅ covered | Left pane renders scrollable transcript reader; right pane renders virtualized/scrollable fact card list |
| overflow | Quote Highlighting | ✅ covered | Multi-line quotes highlighted across line-breaks with normalized whitespace search |
| error | API Failure Feedback | ✅ covered | Actionable Toast notification with error details and retry button |
| long-text | Transcript Reader | 🧪 backstop | Long transcripts (>50k characters) scroll smoothly within bounded height container without window jitter |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| Custom primitives | Button, Badge, Card, Modal, Toast | Internal audited code |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS

**Approval:** approved 2026-09-09
