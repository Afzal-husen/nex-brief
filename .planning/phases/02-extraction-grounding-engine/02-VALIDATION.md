---
phase: "02"
slug: "extraction-grounding-engine"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-09"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.3.x + pytest-asyncio |
| **Config file** | `backend/pyproject.toml` |
| **Quick run command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_grounding.py` |
| **Full suite command** | `backend/.venv/Scripts/python.exe -m pytest backend/tests/` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_grounding.py`
- **After every plan wave:** Run `backend/.venv/Scripts/python.exe -m pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | EXTRACT-01, EXTRACT-03, EXTRACT-04 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_schemas.py` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | EXTRACT-01 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_llm.py` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | EXTRACT-01, EXTRACT-02 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_grounding.py` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | EXTRACT-01, EXTRACT-02, EXTRACT-03, EXTRACT-04 | — | N/A | unit | `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_extraction_graph.py` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_schemas.py` — unit tests for Pydantic epistemic models and categories
- [ ] `backend/tests/test_grounding.py` — unit tests for verbatim substring verification and span extraction
- [ ] `backend/tests/test_extraction_graph.py` — unit tests for LangGraph state machine execution and retry logic

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live Groq API latency & generation | EXTRACT-01 | Requires active Groq API token | Run `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_live_extraction.py -v` with `GROQ_API_KEY` set |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-09-09
