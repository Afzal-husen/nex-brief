# Phase 10: Brief Markdown Editor & Final Approval UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 10-brief-markdown-editor-and-final-approval-ui
**Areas discussed:** Route & Navigation Layout, Editor Experience, Critique & Advisory Display, Approval & Export Flow

---

## Route & Navigation Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated full-page route | Dedicated full-page route at /projects/[id]/brief with sticky top bar, TOC outline, and seamless navigation | ✓ |
| Tabbed workspace view | Tabbed workspace view on /projects/[id] with switchable tabs | |

**User's choice:** Dedicated full-page route at `/projects/[id]/brief`.
**Notes:** Provides a focused editorial environment for reviewing a comprehensive 11-section document without visual clutter.

---

## Editor Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid Section Cards | Each section displays as a structured card with formatted Markdown, an "Edit" toggle for inline editing with live preview, and grounded fact chips | ✓ |
| Full-document Split-Pane | Side-by-side full markdown editor on the left and live rendered preview on the right | |
| Modal Editor | Sections display as read-only cards, and clicking "Edit Section" opens a modal | |

**User's choice:** Hybrid Section Cards.
**Notes:** Gives modular control over the 11 distinct sections while maintaining individual section grounding metadata and critique warnings.

---

## Critique & Advisory Display

| Option | Description | Selected |
|--------|-------------|----------|
| Dual Display | Top critique score & summary banner + inline contextual warning badges on affected sections with a 1-click "Apply Suggested Fix" button | ✓ |
| Slide-over Audit Drawer | A collapsible right-side drawer listing all critique issues | |
| Top Audit Section Only | An expandable critique audit panel at the very top of the brief page | |

**User's choice:** Dual Display.
**Notes:** Top banner gives an executive health check of the brief (0-100 score), while inline badges put actionable critique suggestions directly where the editor is working.

---

## Approval & Export Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Review & Approve Modal | Shows an editorial change summary / diff preview, a "Confirm Approval" button calling backend endpoint, and instant export options | ✓ |
| Direct 1-Click Approval | Instant approval action on the sticky header bar with an immediate confirmation toast | |
| Export-First Flow | Download/Copy options always accessible at any time | |

**User's choice:** Review & Approve Modal.
**Notes:** Provides the critical human-in-the-loop audit gate before finalizing, and triggers backend correction logging for model evaluation.

---

## the agent's Discretion

- Code highlighting / typography styling for rendered Markdown prose.
- Table of contents sticky sidebar behavior on desktop vs collapsible drawer on mobile.
- SWR optimistic mutations and local draft caching.

## Deferred Ideas

- Export directly to Notion / Google Docs / Jira (`EXT-02`, v2).
- Client portal share link with password protection (v2).
- Real-time collaborative multi-user editing (`TEAM-01`, v2).
