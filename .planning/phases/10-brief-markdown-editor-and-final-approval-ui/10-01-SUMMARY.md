---
phase: 10-brief-markdown-editor-and-final-approval-ui
plan: 01
subsystem: brief-ui
tags: [nextjs, react, brief-reader, critique, table-of-contents, grounding]

requires:
  - phase: 09-interactive-gap-clarification-ui
    provides: Clarification flow, synthesis resumption, /clarify route
provides:
  - Dedicated full-page route at /projects/[id]/brief
  - Typed brief API client and useBrief SWR hook
  - BriefHeader with breadcrumbs, status badge, and export/approval triggers
  - BriefCritiqueBanner with circular score meter (0-100) and advisory issue breakdown
  - BriefTableOfContents for quick jumping between the 11 brief sections
  - CritiqueInlineAlert for contextual warnings on affected sections
  - BriefSectionCard for rendering section markdown, word counts, and grounding links
affects: [10-02-PLAN]

actuals:
  tasks: 3
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Modular 11-section document architecture with anchor-based TOC navigation"
    - "Dual critique display: high-level audit score banner + inline contextual alerts"
    - "Grounded section cards linking back to confirmed fact IDs and inference IDs"

key-files:
  created:
    - frontend/src/lib/utils/export-brief.ts
    - frontend/src/components/brief/BriefHeader.tsx
    - frontend/src/components/brief/BriefCritiqueBanner.tsx
    - frontend/src/components/brief/BriefTableOfContents.tsx
    - frontend/src/components/brief/CritiqueInlineAlert.tsx
    - frontend/src/components/brief/BriefSectionCard.tsx
    - frontend/src/app/projects/[id]/brief/page.tsx
  modified:
    - frontend/src/lib/api/types.ts
    - frontend/src/lib/api/client.ts
    - frontend/src/lib/api/hooks.ts
    - frontend/src/components/clarification/ClarificationActionBar.tsx
    - frontend/src/components/workspace/ClarificationFooter.tsx
    - frontend/src/app/projects/[id]/page.tsx

key-decisions:
  - "D-01: Dedicated full-page route at /projects/[id]/brief"
  - "D-02: Workspace and ClarificationFooter primary CTA linking directly to /brief when ready"
  - "D-03: Structured 11-section card presentation with formatted Markdown prose"
  - "D-05: Dual critique UX: Top score banner (0-100) + contextual section warning alerts"

requirements-completed:
  - UI-05
  - BRIEF-03
---

# Plan 10-01 Summary: Brief Reader & Critique Display

Phase 10 Plan 01 delivered the 11-section project brief viewer, automated critique audit panel, and table of contents navigation at `/projects/[id]/brief`.

### Accomplishments

1. **Brief Types & API Client**:
   - Added TypeScript definitions for `BriefSection`, `CritiqueIssue`, `CritiqueReport`, `ProjectBrief`, `BriefResponse`, `ApproveRequest`, `ApproveResponse`.
   - Added `apiClient.workflow.getBrief` and `apiClient.workflow.approve` methods.
   - Added `useBrief` SWR hook with status-aware polling for ongoing synthesis jobs.

2. **Brief Reader Components**:
   - `BriefHeader`: Sticky navigation bar with breadcrumbs, project status pill, quick copy/download buttons, and approval trigger.
   - `BriefCritiqueBanner`: Displays overall critique score (0–100) with color-coded circular badge (emerald, amber, rose), advisory summary, and issue breakdown by severity.
   - `BriefTableOfContents`: Sticky sidebar for navigating the 11 brief sections with active highlight, modified badges, and critique warning icons.
   - `CritiqueInlineAlert`: Embedded warning banners inside affected sections highlighting ungrounded claims or missing constraints.
   - `BriefSectionCard`: Renders individual sections with formatted Markdown, word counts, grounding fact tags, and edit toggles.

3. **Page Route & Navigation**:
   - Created `/projects/[id]/brief` full-page route.
   - Updated `ClarificationActionBar` and `ClarificationFooter` to navigate directly to `/projects/[id]/brief` when brief synthesis completes.

### Verification

- Next.js build: passed (`npm run build` compiled `/projects/[id]/brief` cleanly).
- Backend tests: 63 passed, 1 skipped.
