# Phase 10: Brief Markdown Editor & Final Approval UI - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 10 delivers the final editorial and approval interface (`UI-05`, `BRIEF-03`, `BRIEF-04`, `EVAL-01`). Users can inspect the synthesized 11-section client brief, view automated critique warnings (with overall critique score and issue recommendations), edit individual sections via an interactive Markdown editor with live preview, and execute final human sign-off via an approval flow that triggers backend correction logging (`POST /api/v1/projects/{id}/approve`) and provides instant Markdown export options.

</domain>

<decisions>
## Implementation Decisions

### Route & Navigation Layout
- **D-01:** Dedicated full-page route at `/projects/[id]/brief` — **Reversibility:** costly — Page URL and routing structure. Features a sticky top workspace bar (`← Projects / Workspace / Brief`), document outline table-of-contents jump links, status pill, and seamless navigation from the main project workspace and the gap clarification completion screen.
- **D-02:** Project Workspace entry point: when project status is `synthesis_ready` or `approved`, the main project workspace highlights a primary "Review & Approve Brief" CTA directing to `/projects/[id]/brief`.

### Brief Editor Experience
- **D-03:** Hybrid Section Cards — **Reversibility:** reversible. Each of the 11 brief sections renders as a distinct, beautifully structured card with formatted Markdown text, source fact and inference reference chips, character/word counters, and an "Edit Section" toggle button.
- **D-04:** Inline Markdown editor with live preview: toggling "Edit Section" opens a clean Markdown textarea with a side-by-side or tabbed live rendered preview, undo/reset to AI draft button, and "Save Changes" action that preserves local edits.

### Critique & Advisory Display
- **D-05:** Dual Display critique UX — **Reversibility:** reversible.
  - Top Critique Audit Banner: displays overall critique score (0–100) with color-coded ring/meter (emerald for high, amber for moderate, rose for low), high-level advisory summary, and total issue count.
  - Inline Section Warning Badges: sections with flagged critique issues (ungrounded claims, contradiction neglect, missing constraints, vague deliverables) display contextual warning banners directly within the section card.
- **D-06:** 1-Click "Apply Suggested Fix": critique cards display the AI's `suggested_fix` text and provide an instant 1-click button to insert or replace the suggested fix into the section's content.

### Approval & Export Flow
- **D-07:** Review & Approve Modal — **Reversibility:** one-way — Invokes `POST /api/v1/projects/{id}/approve` which records human approval and persists structured diffs in SQLite `correction_log` table.
- **D-08:** The modal displays an editorial change summary (e.g. "2 sections modified from AI draft"), diff preview of edits against the draft, and an explicit "Confirm Final Approval" button.
- **D-09:** Instant Export Actions: on approval (and accessible from the header), user can 1-click "Copy Full Brief (Markdown)", "Download .md File", or "Copy Executive Summary".
- **D-10:** Approved State Guard: Once approved, the brief displays an "Approved & Grounded" stamp with approval timestamp, and section cards default to locked view with an option to unlock if further revisions are required.

### the agent's Discretion
- Code highlighting / typography styling for rendered Markdown (prose styles using Tailwind Typography / custom zinc styles).
- Table of contents sticky sidebar behavior on desktop vs collapsible drawer on mobile.
- LocalStorage / SWR mutation caching for unstaged in-flight edits.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Models & Endpoints
- `backend/app/models/brief.py` — `ProjectBrief`, `BriefSection`, `SectionKeyEnum`, `CritiqueReport`, `CritiqueIssue`, `SECTION_TITLES`
- `backend/app/api/workflow.py` — `GET /api/v1/projects/{id}/brief` (`BriefResponse`), `POST /api/v1/projects/{id}/approve` (`ApproveRequest`, `ApproveResponse`)
- `backend/app/services/workflow.py` — `get_project_brief_details`, `approve_project_brief`
- `backend/app/models/correction.py` — `CorrectionLog` tracking section-level diffs upon approval

### Frontend API Client & Types
- `frontend/src/lib/api/types.ts` — `BriefResponse`, `ApproveRequest`, `ApproveResponse`, `BriefSection`, `CritiqueReport`, `CritiqueIssue`
- `frontend/src/lib/api/client.ts` — `apiClient.workflow` methods (`getBrief`, `approve`)
- `frontend/src/lib/api/hooks.ts` — `useBrief`, `useProject`

### Requirements & Standards
- `.planning/REQUIREMENTS.md` §UI-05 — User can edit the 11-section brief in a Markdown editor and submit final approval
- `.planning/REQUIREMENTS.md` §BRIEF-03 — User can inspect draft brief and critique notes via REST API
- `.planning/REQUIREMENTS.md` §BRIEF-04 — User can edit brief sections and submit final approval
- `.agents/skills/ui-ux-pro-max/SKILL.md` — Dark mode tokens, accessible typography, interactive micro-animations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/ui/Badge.tsx`: Epistemic status badges, severity badges (critical, warning, info).
- `frontend/src/components/ui/Button.tsx`: Primary, secondary, outline, and ghost variants with loading states.
- `frontend/src/components/ui/Toast.tsx`: Toast notifications for copy/download/save/approval actions.
- `frontend/src/components/workspace/ClarificationFooter.tsx`: Pattern for bottom action bars and status progression.

### Established Patterns
- Dark zinc palette (`bg-zinc-950`, `bg-zinc-900/60`, `border-zinc-800`).
- SWR hooks for fetching and mutating project and brief state (`useProject`, `useBrief`).
- Lucide React icons (`FileText`, `CheckCircle`, `AlertTriangle`, `Edit3`, `Copy`, `Download`, `Sparkles`, `ShieldCheck`).

### Integration Points
- `frontend/src/lib/api/types.ts`: Add typed interfaces for `BriefResponse`, `BriefSection`, `CritiqueReport`, `CritiqueIssue`, `ApproveRequest`, `ApproveResponse`.
- `frontend/src/lib/api/client.ts`: Add `apiClient.workflow.getBrief(projectId)` and `apiClient.workflow.approve(projectId, payload)`.
- `frontend/src/lib/api/hooks.ts`: Add `useBrief(projectId)` hook with SWR.
- `frontend/src/app/projects/[id]/brief/page.tsx`: New dedicated page component for brief review, critique audit, markdown editor, and approval.
- `frontend/src/components/workspace/ClarificationFooter.tsx` & `frontend/src/app/projects/[id]/page.tsx`: CTAs routing to `/projects/[id]/brief`.

</code_context>

<specifics>
## Specific Ideas
- The 11 sections should be numbered and organized according to `SECTION_TITLES` in `backend/app/models/brief.py`.
- Critique banner at the top should have a visual circular or meter indicator of the audit score (0-100).
- When a critique issue provides a `suggested_fix`, an "Apply Fix" button smoothly appends or incorporates the suggestion into the section content.
- Final approval modal summarizes how many sections were edited by human vs left untouched from AI draft.

</specifics>

<deferred>
## Deferred Ideas
- Export directly to Notion / Google Docs / Jira (`EXT-02`, v2).
- Client portal share link with password protection (v2).
- Real-time collaborative multi-user editing (`TEAM-01`, v2).

</deferred>

---

*Phase: 10-brief-markdown-editor-and-final-approval-ui*
*Context gathered: 2026-09-09*
