---
phase: "03"
slug: "contradiction-detection-follow-up-questions"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-09"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.3.x + pytest-asyncio |
| **Config file** | `backend/pyproject.toml` |
| **Quick run command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_contradiction.py` |
| **Full suite command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick test for changed module
- **After every plan wave:** Run `backend/.venv/Scripts/python.exe -m pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | EXTRACT-05 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_schemas.py` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | EXTRACT-05 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_contradiction.py` | ⬜ | ⬜ pending |
| 03-02-01 | 02 | 2 | CLARIFY-01 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_clarification.py` | ⬜ | ⬜ pending |
| 03-02-02 | 02 | 2 | EXTRACT-05, CLARIFY-01 | — | N/A | integration | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_extraction_graph.py` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_contradiction.py` — unit tests for contradiction data models and detection node
- [ ] `backend/tests/test_clarification.py` — unit tests for follow-up question generation and heuristic ranking
- [x] `backend/tests/test_extraction_graph.py` — extended to verify end-to-end 4-node pipeline execution

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live Groq Contradiction Detection | EXTRACT-05 | Requires active API key | Run with `GROQ_API_KEY` set: `pytest backend/tests/test_live_extraction.py` |

---

*Validation strategy created: 2026-09-09*
