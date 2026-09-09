# Phase 9: Interactive Gap Clarification UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 9-interactive-gap-clarification-ui
**Areas discussed:** Review layout & navigation, Contradiction resolution mechanism, Resolution requirements & skip policy, Transcript context assistance

---

## Review Layout & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated full-page route | Dedicated route (`/projects/[id]/clarify`) with breadcrumbs back to workspace, step-by-step resolution flow, and sticky action bar | ✓ |
| Dedicated view inside main workspace | "Clarifications" view / tab inside `/projects/[id]` replacing split view when activated | |
| Slide-over drawer / modal overlay | Modal / drawer overlay appearing on top of the existing dual-pane workspace | |

**User's choice:** Dedicated full-page route (`/projects/[id]/clarify`) with breadcrumbs back to workspace, step-by-step resolution flow, and sticky action bar.
**Notes:** Provides a focused, distraction-free environment for answering detailed technical and scope questions before brief synthesis.

---

## Contradiction Resolution Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| 1-Click choice cards with editable override | 1-Click choice cards ("Accept Claim A", "Accept Claim B", "Reconcile Both") with an editable resolution summary and custom text override | ✓ |
| Radio buttons with required rationale | Radio buttons for Claim A, Claim B, or Neither, requiring a short typed rationale | |
| Freeform resolution textarea only | Freeform resolution textarea with Claim A and Claim B displayed purely as reference callouts | |

**User's choice:** 1-Click choice cards ("Accept Claim A", "Accept Claim B", "Reconcile Both") with an editable resolution summary and custom text override.
**Notes:** Balances quick operator speed with precision control when reconciling transcript inconsistencies.

---

## Resolution Requirements & Skip Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Soft requirement with explicit skips | Direct contradictions and high-impact gaps must be resolved or explicitly marked "Skip / Use AI Assumption"; synthesis unlocked once high-severity items are reviewed | ✓ |
| Permissive | User can trigger brief synthesis at any time, with a confirmation modal summarizing unresolved items | |
| Strict requirement | Every question must be answered or marked "Decline to answer" before synthesis button unlocks | |

**User's choice:** Soft requirement with explicit skips: direct contradictions and high-impact gaps must be resolved or explicitly marked "Skip / Use AI Assumption"; synthesis unlocked anytime once high-severity items are reviewed.
**Notes:** Ensures critical scope/budget conflicts are actively reviewed while avoiding artificial blockers on low-importance unknowns.

---

## Transcript Context Assistance

| Option | Description | Selected |
|--------|-------------|----------|
| Embedded quote snippets + context drawer | Embedded quote snippets in each card with an expandable "View in Transcript Context" drawer showing surrounding dialog lines | ✓ |
| Inline quote cards only | Show verbatim quotes with speaker and category tags directly in card without full transcript view | |
| Full side-by-side split screen | Persistent transcript reader on left and clarification questionnaire on right | |

**User's choice:** Embedded quote snippets in each card with an expandable "View in Transcript Context" modal or drawer showing surrounding dialog lines.
**Notes:** Keeps the clarification questionnaire clean while offering immediate access to surrounding transcript context when needed.

---

## the agent's Discretion

- Choice chip styling and micro-animations.
- Drawer animation physics and keyboard shortcuts (e.g. Esc to close drawer).
- Draft caching in browser state to prevent loss of typed resolutions on navigation.

## Deferred Ideas

- Phase 10: 11-section markdown brief viewer, automated critique findings, and final approval sign-off (`UI-05`).
