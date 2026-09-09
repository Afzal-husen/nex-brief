# Phase 9: Interactive Gap Clarification UI - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 9 delivers the interactive gap clarification and contradiction resolution interface (`UI-04`). Users can review flagged contradictions (selecting preferred claims or writing custom reconciliations), inspect prioritized follow-up questions for unknown gaps (selecting suggested options or inputting custom answers), view surrounding source transcript excerpts for context, and submit clarifications to resume the brief synthesis pipeline via `POST /api/v1/projects/{id}/clarify`.

*Note:* Brief Markdown editing, automated self-critique review, and final approval sign-off are handled in Phase 10 (`UI-05`).

</domain>

<decisions>
## Implementation Decisions

### Clarification Navigation & Layout
- **D-01:** Dedicated full-page route at `/projects/[id]/clarify` — **Reversibility:** costly — Page URL and route structure for clarification flow. Provides a focused, distraction-free environment with a sticky top breadcrumb bar (`← Back to Project Workspace`), live item progress counter (`X of Y items addressed`), and sticky bottom action bar.
- **D-02:** Clarification entry point: clicking the primary "Proceed to Clarifications" button in `ClarificationFooter` on the main workspace route immediately navigates to `/projects/[id]/clarify`.

### Contradiction Resolution Mechanism
- **D-03:** 1-Click interactive choice cards for contradictions: "Accept Claim A", "Accept Claim B", "Reconcile Both", and "Custom Resolution" — **Reversibility:** reversible. Clicking any option populates an editable resolution textarea so the user can review and tailor the exact synthesized statement that will be sent to the backend.
- **D-04:** Highlight conflicting claims: side-by-side or stacked claim cards displaying verbatim quotes, speaker attribution, and conflict rationale note with tension/direct conflict badges.

### Unknown Gap Answering Mechanism
- **D-05:** Suggested options chips: renders `suggested_options` from `ClarificationQuestion` as clickable chips for instant auto-population into the response input, alongside a freeform custom answer textarea.
- **D-06:** Impact level visual cues: High impact (rose badge), Medium impact (amber badge), and Low impact (zinc badge) to help users prioritize critical scope and budget gaps.

### Resolution Requirements & Skip Policy
- **D-07:** Soft requirement with explicit skips — **Reversibility:** reversible. Direct contradictions and high-impact gaps must be either resolved or explicitly marked "Skip / Use AI Assumption". Once all high-severity items have been reviewed, the "Trigger Brief Synthesis" button becomes active.
- **D-08:** Unresolved items: any question marked skipped or left unanswered passes forward with standard fallback handling, enabling synthesis to proceed without blocking the user.

### Transcript Context Assistance
- **D-09:** Embedded quote snippets inside each card with speaker badges and category tags.
- **D-10:** Context Drawer / Modal: each card includes a "View in Transcript Context" button that opens an expandable drawer showing the surrounding 5-10 conversation lines from the source transcript for grounded decision-making.

### Synthesis Handshake
- **D-11:** Submitting clarifications calls `POST /api/v1/projects/{id}/clarify` with `{ clarifications: [{ question_id, resolved_text, resolved_by: "user" }] }` — **Reversibility:** one-way — REST contract with backend LangGraph resume endpoint.
- **D-12:** On successful submission, project status transitions to `synthesizing` and the user is guided back to the workspace or brief viewer with an optimistic progress banner.

### the agent's Discretion
- Exact layout and spacing of choice chips and textareas.
- Drawer animation and transition speed for transcript context view.
- Local draft auto-saving in browser state/sessionStorage so in-progress answers are not lost if the user temporarily navigates back to the workspace.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Models & Endpoints
- `backend/app/models/brief.py` — `UserClarification`, `ProjectBrief`, `BriefSection`, `CritiqueReport`
- `backend/app/models/extraction.py` — `Contradiction`, `UnknownGap`, `ClarificationQuestion`
- `backend/app/api/workflow.py` — `POST /api/v1/projects/{id}/clarify`, `GET /api/v1/projects/{id}/analysis`
- `backend/app/services/workflow.py` — `resume_project_with_clarifications` resuming checkpointer execution

### Frontend API Client & State
- `frontend/src/lib/api/types.ts` — `ClarificationQuestion`, `Contradiction`, `UnknownGap`, `UserClarification`
- `frontend/src/lib/api/client.ts` — `apiClient.workflow.clarify`, `apiClient.workflow.getAnalysis`
- `frontend/src/lib/api/hooks.ts` — `useAnalysis`, `useProject`, `useTranscripts`

### Requirements & Standards
- `.planning/REQUIREMENTS.md` §UI-04 — User can clarify unknowns and resolve contradictions in a dedicated review interface
- `.agents/skills/ui-ux-pro-max/SKILL.md` — Dark mode tokens, accessible contrast, interactive transitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/ui/Badge.tsx`: Epistemic badges for contradiction severity and impact level.
- `frontend/src/components/ui/Button.tsx`: Primary, secondary, outline, and ghost button states with loading spinner.
- `frontend/src/components/ui/Toast.tsx`: Toast feedback for save actions and synthesis start.
- `frontend/src/components/workspace/ClarificationFooter.tsx`: Trigger navigation to `/projects/[id]/clarify`.
- `frontend/src/components/workspace/EpistemicCard.tsx`: Established styling patterns for claims, quotes, and impact badges.

### Established Patterns
- Dark-first Zinc theme (`bg-zinc-950`, surfaces `bg-zinc-900`, borders `border-zinc-800`).
- SWR data fetching and cache revalidation.
- Responsive layout with desktop/mobile ergonomics.

### Integration Points
- `frontend/src/app/projects/[id]/clarify/page.tsx`: New route delivering the full clarification workspace.
- `frontend/src/components/workspace/ClarificationFooter.tsx`: Button updating from informative toast to direct navigation `router.push('/projects/' + projectId + '/clarify')`.
- `POST /api/v1/projects/{id}/clarify`: Endpoint resuming LangGraph workflow to brief synthesis.

</code_context>

<specifics>
## Specific Ideas
- Contradiction cards should clearly separate Claim A and Claim B with distinct quotation blocks and 1-click selection cards.
- Clicking a suggested option chip fills the custom textarea immediately while allowing manual adjustments.
- The sticky bottom bar should show a live progress meter: e.g., "3 of 5 items resolved • 2 high-impact items addressed".

</specifics>

<deferred>
## Deferred Ideas
- **Phase 10**: 11-section markdown brief viewer, critique review panel, and final approval sign-off (`UI-05`).
- **Post-MVP**: Audio recording during clarification or voice memos.

</deferred>

---

*Phase: 9-interactive-gap-clarification-ui*
*Context gathered: 2026-09-09*
