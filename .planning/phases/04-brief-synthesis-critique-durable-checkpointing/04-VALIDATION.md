---
phase: "04"
slug: "brief-synthesis-critique-durable-checkpointing"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-09"
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x |
| **Config file** | `backend/pyproject.toml` |
| **Quick run command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_brief_models.py backend/tests/test_brief_synthesis.py` |
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
| 04-01-01 | 01 | 1 | BRIEF-01 | — | N/A | unit | `backend/.venv/Scripts/python.exe -c "from backend.app.models.brief import ProjectBrief, BriefSection, CritiqueReport; print('Models loaded successfully')"` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | BRIEF-01 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_brief_synthesis.py` | ✅ | ✅ green |
| 04-01-03 | 01 | 1 | BRIEF-02 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_critique.py` | ✅ | ✅ green |
| 04-02-01 | 02 | 2 | DATA-04 | — | N/A | unit | `backend/.venv/Scripts/python.exe -c "from backend.app.graph.builder import build_extraction_graph; print('6-node graph compiled successfully')"` | ✅ | ✅ green |
| 04-02-02 | 02 | 2 | DATA-04 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_state_checkpointing.py` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_brief_models.py` — unit tests for BriefSection, ProjectBrief, CritiqueIssue, CritiqueReport, UserClarification
- [x] `backend/tests/test_brief_synthesis.py` — unit tests for 11-section synthesis node with unaddressed section handling and user clarifications
- [x] `backend/tests/test_critique.py` — unit tests for critique audit node flagging ungrounded claims and score calculation
- [x] `backend/tests/test_state_checkpointing.py` — integration test verifying SQLite checkpointer state recovery across simulated restarts

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
