# Architecture Research

**Domain:** AI-Powered Discovery Call Analysis & Brief Generation System
**Researched:** 2026-09-09
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer (Next.js 16)          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Project View │  │ Analysis UI  │  │ Brief Editor/Diff │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         │                 │                    │            │
├─────────┴─────────────────┴────────────────────┴────────────┤
│                    API Layer (FastAPI ASGI)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ REST Endpoints: /projects, /transcripts, /graph     │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                 │
├───────────────────────────┴─────────────────────────────────┤
│               Orchestration Engine (LangGraph)              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Extract Node │  │ Detect Nodes │  │ Synthesis Nodes   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Groq Client (Llama 3.3 70B Structured Output)       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer (SQLModel)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ ProjectStore │  │ Checkpoints  │  │ Corrections Log   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         ▼                 ▼                    ▼            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ SQLite Database (nexbrief.db with WAL enabled)       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `backend/main.py` | FastAPI application factory, CORS, and lifecycle setup | FastAPI with lifespan context manager |
| `backend/api/` | REST routers handling HTTP requests, query params, and validation | APIRouter modules for projects, transcripts, analysis |
| `backend/db/` | Database engine, session dependencies, and SQLModel tables | SQLModel with SQLite connection pool |
| `backend/agent/graph.py` | LangGraph StateGraph compiling nodes, edges, and interrupts | `StateGraph(BriefState)` with memory checkpointing |
| `backend/agent/nodes.py` | Deterministic extraction, contradiction detection, and synthesis logic | Async functions calling Groq via Pydantic structured output |
| `backend/agent/state.py` | Pydantic data schemas for facts, inferences, unknowns, and brief | TypedDict state and Pydantic validation models |
| `frontend/src/` | Interactive Next.js UI consuming FastAPI endpoints | React Server & Client components with Tailwind CSS |

## Recommended Project Structure

```
nex-brief/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── projects.py       # CRUD for client projects
│   │   │   ├── transcripts.py    # Transcript upload & text handling
│   │   │   └── workflow.py       # LangGraph execution & human interrupt endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # App settings & env loading
│   │   │   └── database.py       # SQLite engine & session generator
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── project.py        # SQLModel Project table
│   │   │   ├── transcript.py     # SQLModel Transcript table
│   │   │   ├── brief.py          # SQLModel Brief table
│   │   │   └── correction.py     # SQLModel CorrectionLog table (Story 14)
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── state.py          # BriefState & Pydantic domain models
│   │   │   ├── prompts.py        # System prompts with few-shot guidance
│   │   │   ├── nodes.py          # Extraction, detection, and synthesis nodes
│   │   │   └── graph.py          # Compiled LangGraph workflow with checkpoints
│   │   ├── main.py               # FastAPI app entrypoint
│   │   └── tests/
│   │       ├── test_api.py
│   │       ├── test_graph.py
│   │       └── test_extraction.py
│   ├── pyproject.toml
│   └── .env
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          # Dashboard / project list
    │   │   └── projects/
    │   │       └── [id]/
    │   │           ├── page.tsx  # Project workspace (transcript, analysis, brief)
    │   │           └── brief/    # Brief view & markdown editor
    │   ├── components/
    │   │   ├── TranscriptViewer.tsx
    │   │   ├── ExtractionCards.tsx
    │   │   ├── GapClarifier.tsx
    │   │   └── BriefReview.tsx
    │   └── lib/
    │       └── api.ts            # Typed client for backend REST API
    ├── package.json
    └── tailwind.config.ts
```

### Structure Rationale

- **Clear Backend Domain Separation:** Isolates data storage (`models/`, `core/`), REST boundary (`api/`), and AI agent orchestration (`agent/`).
- **Graph Decoupled from Web Server:** The LangGraph agent can be tested in isolation via unit tests without spinning up the FastAPI HTTP server.
- **Frontend App Router Alignment:** Dynamic routes under `/projects/[id]` cleanly manage project-specific state, transcript viewing, and brief drafting.

## Architectural Patterns

### Pattern 1: Deterministic Structured Output via Pydantic
**What:** Node functions never receive raw free-form text from the LLM. Instead, `llm.with_structured_output(Schema)` enforces strict schemas.
**When to use:** In every extraction, contradiction, and question generation node.
**Trade-offs:** Constrains LLM flexibility slightly, but eliminates parsing errors and guarantees citation links.

### Pattern 2: LangGraph Human-in-the-Loop Interrupt
**What:** The graph halts at designated review nodes (`human_review_clarify` and `human_approve`).
**When to use:** Before synthesizing the brief and before saving the final brief.
**Trade-offs:** Requires state checkpointing, but gives users complete control and prevents rogue generation.

### Pattern 3: Verbatim Grounding & Character Span Matching
**What:** Extracted facts must contain both the claimed statement and the exact `source_quote` substring from the transcript.
**When to use:** Extraction node validates that `source_quote in transcript_text`. If not found, the quote is rejected or marked unanchored.
**Trade-offs:** Catches hallucinations immediately at ingestion time.

## Data Flow

### Request Flow: Extraction & Human Review

```
[User pastes transcript]
    ↓
[FastAPI /projects/{id}/transcripts] → Saves to SQLite
    ↓
[FastAPI /projects/{id}/analyze] → Triggers LangGraph
    ↓
[extract_knowledge] → Anchors confirmed facts, extracts inferences & unknowns
    ↓
[detect_contradictions] → Scans claims for mutually exclusive statements
    ↓
[generate_questions] → Prioritizes questions for unknowns
    ↓
[Interrupt: human_review_clarify] → State saved to SQLite Checkpointer
    ↓
[UI fetches state] → User sees facts with quotes, answers gaps, resolves contradictions
    ↓
[FastAPI /projects/{id}/resume] → User inputs appended to state; Graph resumes
    ↓
[synthesize_brief] → Compiles 11-section project brief
    ↓
[critique_brief] → Audits draft for hallucinated scope
    ↓
[Interrupt: human_approve] → User edits and clicks Approve
    ↓
[persist_and_log] → Final brief stored; diff logged to CorrectionLog table
```

## Sources

- LangGraph Design Patterns & Checkpointing docs
- FastAPI Architectural Best Practices
- SQLModel / SQLAlchemy 2.0 Async design guides

---
*Architecture research for: NexBrief*
*Researched: 2026-09-09*
