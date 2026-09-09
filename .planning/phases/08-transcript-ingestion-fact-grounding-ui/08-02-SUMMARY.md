---
phase: 08-transcript-ingestion-fact-grounding-ui
plan: 02
subsystem: workspace-ui
tags: [nextjs, react, grounding, split-view, quote-highlighting, epistemic-cards]

requires:
  - phase: 08-transcript-ingestion-fact-grounding-ui
    plan: 01
    provides: IngestionHero, useTranscripts, useAnalysis, and /analysis endpoint
provides:
  - ResizableSplitView drag handle on desktop (30%-70%) and mobile/tablet tab switcher
  - TranscriptPane with whitespace-tolerant quote segmentation and smooth-scroll quote targeting
  - EpistemicCard rendering confirmed facts, inferences, contradictions, and unknown gaps
  - FactCardsPane with segmented category filters and search
  - ClarificationFooter guiding the user toward Phase 9 gap review
  - Integrated ProjectWorkspacePage with bidirectional quote-to-card and card-to-quote grounding
affects: [09-gap-clarification]

actuals:
  tasks: 3
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Non-destructive whitespace-tolerant quote segmentation"
    - "Bidirectional cross-pane grounding linking verbatim quotes and epistemic cards"
    - "Smooth scroll centering with soft glowing anchor flash"
    - "React 19 render-time state adjustment without cascading effect renders"

key-files:
  created:
    - frontend/src/lib/utils/quote-matcher.ts
    - frontend/src/components/workspace/ResizableSplitView.tsx
    - frontend/src/components/workspace/TranscriptPane.tsx
    - frontend/src/components/workspace/EpistemicCard.tsx
    - frontend/src/components/workspace/FactCardsPane.tsx
    - frontend/src/components/workspace/ClarificationFooter.tsx
  modified:
    - frontend/src/app/projects/[id]/page.tsx

key-decisions:
  - "D-01: Resizable dual pane desktop layout clamped between 30% and 70%"
  - "D-02: Mobile/tablet tab switcher with active fact counter"
  - "D-09: Soft glowing emerald highlight badges with active pulse ring"
  - "D-10: Smooth scroll centering when selecting fact cards"
  - "D-11: Bidirectional grounding connecting transcript quotes to cards"
  - "D-12: Whitespace-tolerant quote matching to handle punctuation and line-break variations"
  - "D-13: Segmented filter pills (All, Confirmed, Inferred, Contradictions, Unknowns) with live counts"
  - "D-14: Rich epistemic cards with statement, speaker attribution, verbatim quote preview, and deduction rationale"
  - "D-16: Sticky progression footer leading into Phase 9 gap review"

requirements-completed:
  - UI-03

verification:
  - kind: tsc
    command: "npx tsc -p frontend/tsconfig.json --noEmit"
    status: pass
  - kind: lint
    command: "npm --prefix frontend run lint"
    status: pass (0 errors, 0 warnings)
  - kind: build
    command: "npm --prefix frontend run build"
    status: pass (Next.js production build succeeded)
  - kind: test
    command: "python -m pytest tests/"
    status: pass (63 passed, 1 skipped)
---

# Plan 08-02 Summary: Grounded Dual-Pane Discovery Workspace

Plan 08-02 delivered the complete interactive epistemic grounding workspace for NexBrief (`UI-03`), connecting transcripts and AI extractions into a unified discovery interface.

## Key Accomplishments

1. **Whitespace-Tolerant Quote Segmentation (`quote-matcher.ts`)**:
   - Programmatically identifies verbatim quote intervals within raw transcript text using multi-tier matching (exact, case-insensitive, normalized whitespace token regex).
   - Generates non-overlapping text and quote segments without mutating or altering the original transcript text.

2. **Resizable Split View (`ResizableSplitView.tsx`)**:
   - Provides a dual-pane layout with an interactive drag resizer handle on desktop (clamped between 30% and 70%).
   - Provides a clean mobile and tablet tab switcher (`Transcript` vs `Epistemic Facts`) that automatically switches context when quotes are clicked.

3. **Transcript Reader Pane (`TranscriptPane.tsx`)**:
   - Renders normalized transcript text with grounded quotes styled with soft emerald badge highlights (`bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400`).
   - Automatically centers and pulses the active quote when clicked from a fact card, and supports clicking any quote to focus the associated epistemic fact card.

4. **Epistemic Cards & Filtering (`EpistemicCard.tsx` & `FactCardsPane.tsx`)**:
   - Renders 4 distinct epistemic categories with clear cognitive differentiation:
     - **Confirmed Facts**: Verified client statements with speaker badges and verbatim quote previews with "Locate in Transcript" action.
     - **Inferred Points**: AI inferences with explicit deduction rationales and source fact links.
     - **Contradictions**: Side-by-side or stacked conflicting claims with severity tags and conflict rationales.
     - **Unknown Gaps**: High/medium/low impact gaps with suggested follow-up questions.
   - Segmented filter pills with real-time count badges and live search filtering.

5. **Progression Footer & Page Integration (`page.tsx` & `ClarificationFooter.tsx`)**:
   - Replaced placeholder content in `frontend/src/app/projects/[id]/page.tsx` with full end-to-end integration:
     - If no transcript exists: renders `IngestionHero`.
     - Once saved: displays subheader with status badge, replace action, and "Run Extraction" CTA.
     - While analyzing: displays animated extraction status banner.
     - When analysis is complete: renders `ResizableSplitView` with bidirectional quote grounding and `ClarificationFooter`.
