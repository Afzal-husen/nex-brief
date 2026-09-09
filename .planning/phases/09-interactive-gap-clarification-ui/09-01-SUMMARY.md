---
phase: 09-interactive-gap-clarification-ui
plan: 01
subsystem: clarification-ui
tags: [nextjs, react, clarification, contradictions, unknown-gaps, drawer, synthesis-resume]

requires:
  - phase: 08-transcript-ingestion-fact-grounding-ui
    provides: Grounded workspace, /analysis endpoint, IngestionHero, ClarificationFooter
provides:
  - Dedicated full-page route at /projects/[id]/clarify
  - 1-Click choice resolution cards for contradictions (Claim A, Claim B, Reconcile, Custom)
  - Clickable suggested option chips and custom answer input for unknown gaps
  - Slide-over TranscriptContextDrawer displaying surrounding dialogue lines
  - ClarificationProgressHeader with breadcrumbs and live completion meter
  - ClarificationActionBar with soft-requirement validation and brief synthesis trigger
affects: [10-brief-markdown-editor-approval]

actuals:
  tasks: 3
  commits: 1

tech-stack:
  added: []
  patterns:
    - "1-Click choice pre-filling with editable final resolution textarea"
    - "Surrounding dialogue window extraction (radius of 5 lines) for grounded context"
    - "Soft requirement enforcement with explicit skip bypass"
    - "sessionStorage draft caching to prevent data loss across navigations"
    - "LangGraph checkpoint resumption via POST /api/v1/projects/{id}/clarify"

key-files:
  created:
    - frontend/src/lib/utils/transcript-context.ts
    - frontend/src/components/clarification/TranscriptContextDrawer.tsx
    - frontend/src/components/clarification/ContradictionResolverCard.tsx
    - frontend/src/components/clarification/UnknownGapQuestionCard.tsx
    - frontend/src/components/clarification/ClarificationProgressHeader.tsx
    - frontend/src/components/clarification/ClarificationActionBar.tsx
    - frontend/src/app/projects/[id]/clarify/page.tsx
  modified:
    - frontend/src/lib/api/types.ts
    - frontend/src/lib/api/client.ts
    - frontend/src/components/workspace/ClarificationFooter.tsx
    - frontend/src/app/projects/[id]/page.tsx

key-decisions:
  - "D-01: Dedicated full-page route at /projects/[id]/clarify"
  - "D-02: Clarification entry point via ClarificationFooter button in workspace"
  - "D-03: 1-Click interactive choice cards for contradictions (Accept Claim A, Accept Claim B, Reconcile, Custom)"
  - "D-04: Side-by-side or stacked conflicting claim cards with quotes, speaker tags, and severity badges"
  - "D-05: Clickable suggested option chips for instant filling of unknown gap answers"
  - "D-06: Color-coded impact levels (Rose for High, Amber for Medium, Zinc for Low)"
  - "D-07: Soft requirement: all direct contradictions and high-impact gaps must be answered or explicitly skipped before synthesis unlocks"
  - "D-08: Explicitly skipped questions fallback to standard AI inference"
  - "D-09 & D-10: Slide-over transcript context drawer showing 5 lines before and after target quotes"
  - "D-11: Submitting clarifications calls POST /api/v1/projects/{id}/clarify to resume brief synthesis"

requirements-completed:
  - UI-04

verification:
  - kind: tsc
    command: "npx tsc -p frontend/tsconfig.json --noEmit"
    status: pass
  - kind: lint
    command: "npm --prefix frontend run lint"
    status: pass (0 errors, 0 warnings)
  - kind: build
    command: "npm --prefix frontend run build"
    status: pass (Generated /projects/[id]/clarify route)
  - kind: test
    command: "python -m pytest tests/"
    status: pass (63 passed, 1 skipped)
---

# Plan 09-01 Summary: Interactive Gap Clarification UI

Plan 09-01 delivered the complete interactive gap clarification and contradiction resolution interface (`UI-04`), enabling operators to resolve ambiguities and conflicting discovery transcript statements before generating the final 11-section project brief.

## Key Accomplishments

1. **Clarification API & Data Layer**:
   - Extended `types.ts` and `client.ts` with `UserClarification`, `ClarifyRequest`, `ClarifyResponse`, and `apiClient.workflow.clarify`.
   - Created `transcript-context.ts` extracting surrounding dialogue lines (5 lines radius) around any target quote.

2. **Dedicated Clarification Route (`/projects/[id]/clarify`)**:
   - Built full-page distraction-free review workspace with breadcrumbs back to the project workspace.
   - Connected `ClarificationFooter` in `/projects/[id]` to navigate directly to the clarify route.
   - Implemented zero-loss local draft caching via `sessionStorage`.

3. **Contradiction Resolver Cards (`ContradictionResolverCard.tsx`)**:
   - Renders Claim A and Claim B in side-by-side cards with speaker tags, verbatim quotes, and tension rationale.
   - Provides 1-click resolution buttons ("Accept Claim A", "Accept Claim B", "Reconcile Both", "Custom Resolution") that auto-populate an editable resolution textarea.
   - Includes "View in Transcript Context" actions for Claim A and Claim B.

4. **Unknown Gap Question Cards (`UnknownGapQuestionCard.tsx`)**:
   - Renders prioritized follow-up questions with color-coded impact level tags (`HIGH`, `MEDIUM`, `LOW`).
   - Clickable suggested option chips for instant auto-filling alongside custom answer input.
   - Explicit "Skip Question" toggle allowing low-risk unknowns to proceed with AI assumptions.

5. **Transcript Context Drawer (`TranscriptContextDrawer.tsx`)**:
   - Accessible slide-over drawer showing surrounding transcript dialogue with line numbers and emerald quote highlighting.

6. **Progress Tracking & Synthesis Trigger (`ClarificationActionBar.tsx` & `ClarificationProgressHeader.tsx`)**:
   - Live completion counter and progress bar.
   - Soft gate validation: ensures all contradictions and high-impact gaps are addressed or explicitly skipped before enabling "Trigger Brief Synthesis".
   - Seamlessly calls `POST /api/v1/projects/{id}/clarify` to resume the LangGraph checkpointed execution.
