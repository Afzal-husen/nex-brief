# Phase 8: Transcript Ingestion & Fact Grounding UI - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 delivers the transcript ingestion interface and the epistemic fact grounding workspace (`UI-02`, `UI-03`). Users can paste or upload conversation transcripts (.txt, .md, .vtt, .srt), view the normalized transcript in a dedicated reader pane, run the AI extraction pipeline, inspect categorized epistemic cards (Confirmed Facts, Inferred Points, Contradictions, and Unknown Gaps), and interact bidirectionally between fact cards and verbatim quotes highlighted and centered in the transcript.

*Note:* Interactive gap clarification and contradiction resolution dialogs are handled in Phase 9 (`UI-04`), and brief synthesis markdown editing/approval is Phase 10 (`UI-05`).

</domain>

<decisions>
## Implementation Decisions

### Workspace Layout & Split View
- **D-01:** Resizable dual pane with drag handle on desktop — users can adjust pane widths between the transcript reader on the left and the epistemic cards panel on the right.
- **D-02:** Responsive tabbed toggle on mobile and tablet viewports (`Transcript` tab vs `Facts` tab) with persistent active-fact indicator badge to ensure smooth reading and context retention on smaller screens.
- **D-03:** Sticky workspace sub-header with breadcrumbs back to the dashboard, project title, live status badge, and an actionable `Analyze / Run Extraction` action button.
- **D-04:** Initial state: full-width focused ingestion card before any transcript has been submitted. Once saved, it smoothly transitions into the dual-pane workspace.

### Transcript Ingestion UX
- **D-05:** Dual input tabs in the ingestion component:
  - `Paste Text` tab with a large auto-growing textarea
  - `Upload File` tab with a drag-and-drop zone supporting `.txt`, `.md`, `.vtt`, and `.srt` file formats.
- **D-06:** Live metrics inspection bar showing real-time character count, estimated word count, and detected speaker cues (e.g. "3 speakers detected: Client, Alex, Sarah").
- **D-07:** Single active transcript per project for v1 with an explicit `Replace / Re-upload` action if the user wishes to update or swap the conversation text.
- **D-08:** Direct inline `Start Analysis` CTA button once transcript is saved, showing a subtle loading spinner and immediately triggering the backend extraction workflow (`POST /api/v1/projects/{id}/analyze`).

### Quote Highlighting & Auto-Scroll
- **D-09:** Soft glowing badge highlight visual treatment: `bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400` with a subtle 1.5s pulse animation, ensuring high contrast in dark mode without obscuring surrounding text.
- **D-10:** Smooth scrolling (`behavior: 'smooth'`) that vertically centers the target quote within the transcript pane when a fact card is clicked, accompanied by an anchor flash ring.
- **D-11:** Bidirectional grounding: clicking an anchored quote span in the transcript reader scrolls to and selects its corresponding fact card in the right pane.
- **D-12:** Normalized whitespace quote matching: collapses multi-space and newline variations between LLM quote citations and raw transcript text to prevent broken highlights.

### Epistemic Card Filtering & Grouping
- **D-13:** Segmented filter pills at the top of the right pane: `All`, `Confirmed Facts`, `Inferred Points`, `Contradictions`, `Unknown Gaps`, with live count badges and a search/filter input.
- **D-14:** Rich epistemic card design: bold fact/point statement, speaker attribution pill, category/domain tag, verbatim quote preview block with click-to-locate action, and an explicit reasoning explanation note for inferred points.
- **D-15:** Dedicated FastAPI backend endpoint `GET /api/v1/projects/{id}/analysis` to query and return the latest checkpointed extraction state (confirmed facts, inferred points, contradictions, unknown gaps, clarification questions), paired with SWR caching on the frontend.
- **D-16:** Sticky action footer at the bottom of the fact pane: "Proceed to Clarifications (X items to resolve) ->" which activates once extraction is complete and guides the user into the Phase 9 gap review.

### the agent's Discretion
- Component folder layout in `frontend/src/components/workspace/` (e.g., `TranscriptPane.tsx`, `FactCardsPane.tsx`, `IngestionDropzone.tsx`, `SplitView.tsx`).
- Exact drag handle interaction styling and min/max pane constraints (e.g., min 30%, max 70%).
- Utility functions for regex-based quote token matching in `frontend/src/lib/utils/quote-highlighter.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Models & Endpoints
- `backend/app/models/transcript.py` — SQLModel schema for `Transcript`, `TranscriptCreate`, `TranscriptRead`
- `backend/app/models/extraction.py` — Pydantic models for `ConfirmedFact`, `InferredPoint`, `Contradiction`, `UnknownGap`, `ClarificationQuestion`
- `backend/app/api/transcripts.py` — Transcript ingestion router (`POST /api/v1/projects/{id}/transcripts`, `GET /api/v1/projects/{id}/transcripts`)
- `backend/app/api/workflow.py` — Workflow triggering router (`POST /api/v1/projects/{id}/analyze`) and new `GET /api/v1/projects/{id}/analysis`
- `backend/app/services/workflow.py` — `trigger_project_analysis` and checkpointer state access logic

### Requirements & UI Standards
- `.planning/REQUIREMENTS.md` §UI-02 — Upload/paste transcript and formatted text viewing
- `.planning/REQUIREMENTS.md` §UI-03 — Epistemic fact cards and quote highlight linking
- `.agents/skills/ui-ux-pro-max/SKILL.md` — Dark mode tokens, interactive micro-animations, accessible colors
- `.agents/skills/vercel-react-best-practices/SKILL.md` — SWR data fetching, bundle splitting, React performance

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/ui/Button.tsx`: Button with variants (`primary`, `secondary`, `outline`, `ghost`, `danger`) and loading state.
- `frontend/src/components/ui/Badge.tsx`: Epistemic and project status badge with pulsing animation for active states.
- `frontend/src/components/ui/Card.tsx`: Dark-surface card styling with 1px border.
- `frontend/src/components/ui/Toast.tsx`: Toast notifications for API and ingestion feedback.
- `frontend/src/components/ui/Skeleton.tsx`: Content loading placeholders.
- `frontend/src/lib/api/client.ts`: Typed API client with `api.transcripts` and `api.workflow` namespaces ready to be extended.
- `frontend/src/lib/api/hooks.ts`: SWR wrapper hooks (`useProject`, `useProjects`).

### Established Patterns
- Dark-first zinc theme (`bg-zinc-950`, surfaces `bg-zinc-900`, borders `border-zinc-800`).
- SWR data fetching with optimistic updates and conditional polling.
- Lucide React icon integration.

### Integration Points
- `frontend/src/app/projects/[id]/page.tsx`: The primary workspace route currently displaying a placeholder for Phase 8.
- `POST /api/v1/projects/{project_id}/transcripts`: Ingests and normalizes raw transcript.
- `POST /api/v1/projects/{id}/analyze`: Runs extraction graph up to the clarification gate.
- `GET /api/v1/projects/{id}/analysis`: New endpoint to retrieve checkpointed analysis state.

</code_context>

<specifics>
## Specific Ideas
- The quote highlighter should feel immediate and precise: clicking a fact card snaps/smooth-scrolls the left reader directly to the verbatim quote, glowing with a soft emerald pulse.
- When hovering or clicking an anchored quote span in the transcript reader, the corresponding fact card on the right should light up with a subtle active border ring.
- Drag-and-drop file upload should support `.txt`, `.md`, `.vtt`, and `.srt`, parsing text cleanly and displaying detected speakers.

</specifics>

<deferred>
## Deferred Ideas
- **Interactive Clarification Dialogs (`UI-04`)**: Answering unknown questions and resolving contradictions in Phase 9.
- **Brief Editor & Approval (`UI-05`)**: 11-section markdown editor and final approval in Phase 10.
- **Audio / Video file speech-to-text upload (`EXT-03`)**: Server-side Whisper transcription deferred to post-MVP.

</deferred>

---

*Phase: 8-transcript-ingestion-fact-grounding-ui*
*Context gathered: 2026-09-09*
