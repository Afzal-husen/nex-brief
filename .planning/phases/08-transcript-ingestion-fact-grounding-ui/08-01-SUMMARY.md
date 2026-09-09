---
phase: 08-transcript-ingestion-fact-grounding-ui
plan: 01
subsystem: api-and-ui
tags: [fastapi, nextjs, react, swr, transcript-ingestion, speaker-detection]

requires:
  - phase: 07-frontend-api-client-project-dashboard
    provides: Frontend API client, SWR setup, and UI primitives
provides:
  - GET /api/v1/projects/{id}/analysis endpoint accessing LangGraph checkpoint state
  - Frontend typed API methods and SWR hooks (useTranscripts, useAnalysis)
  - Client-side transcript file parser for .txt, .md, .vtt, .srt
  - IngestionHero component with dual paste/upload tabs and live metrics bar
affects: [08-02, 09-gap-clarification]

actuals:
  tasks: 3
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Checkpointed analysis state retrieval without triggering re-extraction"
    - "Timed transcript stripping for VTT/SRT files in the browser"
    - "Real-time regex speaker detection and live character/word counters"

key-files:
  created:
    - backend/tests/test_analysis_endpoint.py
    - frontend/src/lib/utils/transcript-parser.ts
    - frontend/src/components/workspace/IngestionHero.tsx
  modified:
    - backend/app/api/workflow.py
    - backend/app/services/workflow.py
    - frontend/src/lib/api/types.ts
    - frontend/src/lib/api/client.ts
    - frontend/src/lib/api/hooks.ts

key-decisions:
  - "D-05: Dual input tabs (Paste Text & Upload File dropzone) with live metrics bar"
  - "D-06: Real-time speaker cue detection parsing line prefixes"
  - "D-15: Dedicated GET /api/v1/projects/{id}/analysis endpoint to fetch checkpointed facts across page reloads"

patterns-established:
  - "Pattern: Use checkpointer graph.get_state() for instant recovery of intermediate extraction facts"

requirements-completed:
  - UI-02

coverage:
  - id: D1
    description: "GET /api/v1/projects/{id}/analysis endpoint"
    requirement: UI-02
    verification:
      - kind: unit
        ref: "backend/tests/test_analysis_endpoint.py"
        status: pass
  - id: D2
    description: "Transcript file parsing & speaker cue extraction utility"
    requirement: UI-02
    verification:
      - kind: unit
        ref: "frontend/src/lib/utils/transcript-parser.ts"
        status: pass
  - id: D3
    description: "IngestionHero component with live metrics and analysis CTA"
    requirement: UI-02
    verification:
      - kind: automated_ui
        ref: "frontend/src/components/workspace/IngestionHero.tsx"
        status: pass
---

# Phase 8 Plan 1: Summary

Implemented the backend analysis endpoint and the complete frontend ingestion experience for transcript submission.

## Accomplishments
1. **FastAPI Analysis Endpoint**: Added `GET /api/v1/projects/{id}/analysis` in `backend/app/api/workflow.py` and `backend/app/services/workflow.py`, connecting to the LangGraph SqliteSaver checkpointer to retrieve intermediate facts, inferences, contradictions, and unknowns without executing new LLM inferences.
2. **Pytest Verification**: Added `backend/tests/test_analysis_endpoint.py` covering 404s, missing transcripts, and checkpointed extractions. All 63 backend tests pass.
3. **Frontend API & Hooks**: Extended `frontend/src/lib/api/types.ts`, `client.ts`, and `hooks.ts` with `Transcript`, `ConfirmedFact`, `InferredPoint`, `AnalyzeResponse`, `api.transcripts`, `api.workflow`, `useTranscripts`, and `useAnalysis`.
4. **Transcript Parser**: Implemented `frontend/src/lib/utils/transcript-parser.ts` to cleanly strip VTT/SRT timing cues and detect speaker prefixes in real time.
5. **IngestionHero UI**: Built the focused ingestion hero component with dual tabs, live character/word/speaker metrics, and instant analysis initiation.
