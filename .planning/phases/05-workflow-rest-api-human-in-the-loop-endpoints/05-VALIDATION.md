---
phase: "05"
slug: "workflow-rest-api-human-in-the-loop-endpoints"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-09"
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x |
| **Config file** | `backend/pyproject.toml` |
| **Quick run command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_workflow_api.py` |
| **Full suite command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | CLARIFY-02 | — | N/A | unit | `backend/.venv/Scripts/python.exe -c "from backend.app.models.brief_record import ProjectBriefRecord; print('Model loaded')"` | ✅ | ✅ green |
| 05-01-02 | 01 | 1 | CLARIFY-02 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_workflow_api.py -k test_analyze_interrupt` | ✅ | ✅ green |
| 05-02-01 | 02 | 2 | CLARIFY-03 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_workflow_api.py -k test_clarify_resume` | ✅ | ✅ green |
| 05-02-02 | 02 | 2 | BRIEF-03, BRIEF-04 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_workflow_api.py -k test_brief_inspect_and_approve` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_workflow_api.py` — API integration test suite covering `/analyze`, `/clarify`, `/brief`, and `/approve`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | — | All phase behaviors have automated verification | N/A |

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-09
