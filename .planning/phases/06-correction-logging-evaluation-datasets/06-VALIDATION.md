---
phase: "06"
slug: "correction-logging-evaluation-datasets"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-09"
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x |
| **Config file** | `backend/pyproject.toml` |
| **Quick run command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_correction_eval.py` |
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
| 06-01-01 | 01 | 1 | EVAL-01 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_correction_eval.py -k test_compute_section_diffs` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | EVAL-01 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_correction_eval.py -k test_approval_creates_correction_logs` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 2 | EVAL-02 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_correction_eval.py -k test_eval_api_endpoints` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 2 | EVAL-02 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_correction_eval.py -k test_cli_export` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_correction_eval.py` — Test suite covering diff engine, approval hooks, API endpoints, and CLI export

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
