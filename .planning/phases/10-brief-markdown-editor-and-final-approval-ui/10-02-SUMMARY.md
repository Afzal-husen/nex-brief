---
phase: 10-brief-markdown-editor-and-final-approval-ui
plan: 02
subsystem: brief-editor-approval
tags: [nextjs, react, markdown-editor, approval, diff-review, export, evaluation-dataset]

requires:
  - plan: 10-01
    provides: Brief reader, critique banner, BriefSectionCard, /brief route
provides:
  - BriefMarkdownEditor with syntax toolbar (Bold, Italic, Heading, List, Code) and live preview
  - 1-Click "Apply Suggested Fix" in CritiqueInlineAlert to incorporate AI recommendations
  - Diff tracking comparing editor overrides against original AI draft
  - ApprovalModal showing human modification summary and section diff highlights
  - Final human approval flow calling POST /api/v1/projects/{id}/approve (persisting correction diffs in SQLite)
  - 1-Click export actions: Copy Full Markdown to clipboard and Download sanitized .md file
  - Approved & Grounded banner with timestamp locking post-approval editing
affects: [milestone-completion]

actuals:
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Section-level Markdown editing with real-time live preview tab"
    - "1-Click AI fix application into editable section state"
    - "Human sign-off gate triggering structured diff logging for prompt evaluation (EVAL-01)"
    - "Client-side Markdown export and file download generation"

key-files:
  created:
    - frontend/src/components/brief/BriefMarkdownEditor.tsx
    - frontend/src/components/brief/ApprovalModal.tsx
  modified:
    - frontend/src/lib/utils/export-brief.ts
    - frontend/src/components/brief/CritiqueInlineAlert.tsx
    - frontend/src/components/brief/BriefSectionCard.tsx
    - frontend/src/app/projects/[id]/brief/page.tsx

key-decisions:
  - "D-03 & D-04: Inline Markdown editing per section with live preview and reset-to-draft capability"
  - "D-06: 1-Click 'Apply Suggested Fix' directly updating active section content"
  - "D-07 & D-08: Approval modal displaying human modification count and diff highlights before sign-off"
  - "D-09: 1-Click export actions (Copy Markdown, Download .md)"
  - "D-10: Approved status stamp with approval timestamp"

requirements-completed:
  - UI-05
  - BRIEF-04
  - EVAL-01
---

# Plan 10-02 Summary: Section Markdown Editor & Final Approval

Phase 10 Plan 02 delivered the section-level Markdown editor, 1-click critique fix applicator, approval diff review modal, and final approval sign-off pipeline.

### Accomplishments

1. **Brief Markdown Editor**:
   - Built `BriefMarkdownEditor` with formatting toolbar buttons (`**bold**`, `*italic*`, `### heading`, `- list`, `` `code` ``).
   - Real-time tabbed toggle between "Write" and "Preview".
   - Word count and character count meters.
   - "Save Section", "Cancel", and "Reset to AI Draft" actions.

2. **Critique Fix Integration**:
   - Updated `CritiqueInlineAlert` with `onApplyFix` action.
   - Operators can 1-click apply any AI critique recommendation, which instantly appends or integrates into the section content.

3. **Approval Modal & Diff Review**:
   - Built `ApprovalModal` showing total modified sections vs untouched AI draft sections.
   - Side-by-side diff preview comparing original AI draft with approved human revisions.
   - Calls `POST /api/v1/projects/{id}/approve` with `{ edited_brief: { sections, full_markdown } }`, updating project status to `approved` and recording section diffs in the SQLite `correction_log` table (`EVAL-01`).

4. **Export Tools & Approved View**:
   - 1-Click "Copy Full Brief (Markdown)" and "Download .md File".
   - "Approved & Grounded" header banner with approval timestamp.

### Verification

- Next.js build: passed (`npm run build` compiled `/projects/[id]/brief` cleanly).
- Backend tests: 63 passed, 1 skipped (covering `approve_project_brief` and correction logging).
