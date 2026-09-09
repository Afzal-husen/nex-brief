# Graph Report - nex-brief  (2026-09-09)

## Corpus Check
- 101 files · ~124,895 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 816 nodes · 1226 edges · 68 communities (61 shown, 7 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bc293cc4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User Stories
- devDependencies
- compilerOptions
- models/extraction.py
- Project
- Architecture
- Codebase Concerns
- Technology Stack
- Coding Conventions
- External Integrations
- Codebase Structure
- layout.tsx
- Testing Patterns
- LangGraph Workflow Specification
- frontend/README.md
- NexBrief Agent Architecture Decisions
- Evaluation Dataset from User Corrections
- Setup FastAPI, LangGraph, and Groq in Backend
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- backend
- Communities (49 total, 5 thin omitted)
- AGENTS.md
- Implications for Roadmap
- Phase 1: Backend Foundation & Persistence - Context
- Phase Details
- v1 Requirements
- Architecture Research
- Feature Research
- test_grounding.py
- NexBrief
- test_api.py
- Pitfalls Research
- Stack Research
- Project State
- Phase 1: Backend Foundation & Persistence - Discussion Log
- conftest.py
- Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas
- Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification
- database.py
- Phase 2: Extraction & Grounding Engine - Research
- Phase 2: Extraction & Grounding Engine - Context
- app/__init__.py
- Phase 3: Contradiction Detection & Follow-up Questions - Context
- services/extraction.py
- Graph Report - nex-brief  (2026-09-09)
- Phase 3: Contradiction Detection & Follow-up Questions - Research
- Phase 2: Extraction & Grounding Engine Verification Report
- Phase 2: Extraction & Grounding Engine - Discussion Log
- Phase 02 — Validation Strategy
- Goal Achievement
- Phase 3: Contradiction Detection & Follow-up Questions - Discussion Log
- Phase 03 — Validation Strategy
- Phase 2 Plan 02-01 Summary: Epistemic Schemas & Groq LLM Client
- Phase 2 Plan 02-02 Summary: Verbatim Grounding Verifier & LangGraph Pipeline
- clear_mock_clarification_client
- Plan 03-01 Summary: Contradiction Detection Node with Verbatim Grounding
- Plan 03-02 Summary: Prioritized Question Generator Node & 4-Node Pipeline Integration

## God Nodes (most connected - your core abstractions)
1. `Communities (49 total, 5 thin omitted)` - 40 edges
2. `FactCategory` - 31 edges
3. `ExtractionState` - 24 edges
4. `RawExtractionPayload` - 20 edges
5. `generate_clarifications_node()` - 19 edges
6. `Project` - 19 edges
7. `detect_contradictions_node()` - 18 edges
8. `RawFactCandidate` - 17 edges
9. `UnknownGap` - 16 edges
10. `find_quote_spans()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `test_clarification_empty_state()` --calls--> `generate_clarifications_node()`  [INFERRED]
  backend/tests/test_clarification.py → backend/app/graph/nodes/generate_clarifications.py
- `test_verify_candidate_facts_deduplication()` --uses--> `FactCategory`  [INFERRED]
  backend/tests/test_grounding.py → backend/app/models/extraction.py
- `test_verify_candidate_facts_unverified_retained()` --uses--> `FactCategory`  [INFERRED]
  backend/tests/test_grounding.py → backend/app/models/extraction.py
- `test_verify_candidate_facts_with_mock_retry_success()` --uses--> `FactCategory`  [INFERRED]
  backend/tests/test_grounding.py → backend/app/models/extraction.py
- `test_fact_categories()` --uses--> `FactCategory`  [INFERRED]
  backend/tests/test_schemas.py → backend/app/models/extraction.py

## Import Cycles
- None detected.

## Communities (68 total, 7 thin omitted)

### Community 0 - "User Stories"
Cohesion: 0.10
Nodes (19): 10. Create a Project Brief, 11. Review the Brief, 12. Edit the Brief, 13. Approve the Brief, 14. Learn From Corrections, 1. Create a Project, 2. Add a Discovery Call, 3. Understand the Client (+11 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (34): babel-plugin-react-compiler, eslint, eslint-config-next, dependencies, next, react, react-dom, devDependencies (+26 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 3 - "models/extraction.py"
Cohesion: 0.07
Nodes (92): clear_mock_contradiction_client(), clear_mock_extraction_client(), get_extraction_llm_with_fallback(), get_groq_llm(), get_structured_clarification_client(), get_structured_contradiction_client(), get_structured_extraction_client(), Any (+84 more)

### Community 4 - "Project"
Cohesion: 0.08
Nodes (47): create_project(), delete_project(), get_project(), list_projects(), get, post, Session, Create a new project container. (+39 more)

### Community 5 - "Architecture"
Cohesion: 0.25
Nodes (7): Architecture, Cross-Cutting Concerns, Data Flow, Error Handling, Key Abstractions, Layers, Pattern Overview

### Community 6 - "Codebase Concerns"
Cohesion: 0.25
Nodes (7): Codebase Concerns, Fragile Areas, Known Bugs, Performance Bottlenecks, Scaling Limits, Security Considerations, Tech Debt

### Community 7 - "Technology Stack"
Cohesion: 0.25
Nodes (7): Configuration, Frameworks, Key Dependencies, Languages, Platform Requirements, Runtime, Technology Stack

### Community 8 - "Coding Conventions"
Cohesion: 0.29
Nodes (6): Code Style & Formatting, Coding Conventions, Error Handling, Import Organization, Logging, Naming Patterns

### Community 9 - "External Integrations"
Cohesion: 0.29
Nodes (6): APIs & External Services, Authentication & Identity, CI/CD & Deployment, Data Storage, External Integrations, Monitoring & Observability

### Community 10 - "Codebase Structure"
Cohesion: 0.29
Nodes (6): Codebase Structure, Directory Layout, Directory Purposes, Key File Locations, Naming Conventions, Where to Add New Code

### Community 11 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 12 - "Testing Patterns"
Cohesion: 0.40
Nodes (4): Mocking & Fixtures, Test File Organization, Test Framework, Testing Patterns

### Community 13 - "LangGraph Workflow Specification"
Cohesion: 0.40
Nodes (4): Graph Nodes & Edges, LangGraph Workflow Specification, Overview, State Definition (`BriefState`)

### Community 14 - "frontend/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 15 - "NexBrief Agent Architecture Decisions"
Cohesion: 0.50
Nodes (3): NexBrief Agent Architecture Decisions, Summary, Technical Decisions

### Community 16 - "Evaluation Dataset from User Corrections"
Cohesion: 0.50
Nodes (3): Evaluation Dataset from User Corrections, Purpose, Seed Idea

### Community 17 - "Setup FastAPI, LangGraph, and Groq in Backend"
Cohesion: 0.50
Nodes (3): Context, Setup FastAPI, LangGraph, and Groq in Backend, Tasks

### Community 25 - "Communities (49 total, 5 thin omitted)"
Cohesion: 0.05
Nodes (40): Communities (49 total, 5 thin omitted), Community 0 - "User Stories", Community 10 - "Codebase Structure", Community 11 - "layout.tsx", Community 12 - "Testing Patterns", Community 13 - "LangGraph Workflow Specification", Community 14 - "frontend/README.md", Community 15 - "NexBrief Agent Architecture Decisions" (+32 more)

### Community 26 - "AGENTS.md"
Cohesion: 0.08
Nodes (25): Architecture, Code Style & Formatting, Configuration, Constraints, Conventions, Cross-Cutting Concerns, Data Flow, Developer Profile (+17 more)

### Community 27 - "Implications for Roadmap"
Cohesion: 0.08
Nodes (23): Architecture Approach, Confidence Assessment, Critical Pitfalls, Executive Summary, Expected Features, Gaps to Address, Implications for Roadmap, Key Findings (+15 more)

### Community 28 - "Phase 1: Backend Foundation & Persistence - Context"
Cohesion: 0.12
Nodes (16): API Route Structure & CORS Policy, Automated Testing Strategy, Canonical References, Database Engine & Schema Lifecycle, Deferred Ideas, Established Patterns, Existing Code Insights, Folded Todos (+8 more)

### Community 29 - "Phase Details"
Cohesion: 0.12
Nodes (15): Overview, Phase 10: Brief Markdown Editor & Final Approval UI, Phase 1: Backend Foundation & Persistence, Phase 2: Extraction & Grounding Engine, Phase 3: Contradiction Detection & Follow-up Questions, Phase 4: Brief Synthesis, Critique & Durable Checkpointing, Phase 5: Workflow REST API & Human-in-the-Loop Endpoints, Phase 6: Correction Logging & Evaluation Datasets (Story 14) (+7 more)

### Community 30 - "v1 Requirements"
Cohesion: 0.13
Nodes (14): Brief Synthesis & Critique, Clarification & Human Interrupt Gate, Collaboration & Customization, Data Model & Persistence (Backend Core), Evaluation & Learning (Story 14), Extended Integrations, Frontend Experience, Ingestion & API Layer (+6 more)

### Community 31 - "Architecture Research"
Cohesion: 0.14
Nodes (13): Architectural Patterns, Architecture Research, Component Responsibilities, Data Flow, Pattern 1: Deterministic Structured Output via Pydantic, Pattern 2: LangGraph Human-in-the-Loop Interrupt, Pattern 3: Verbatim Grounding & Character Span Matching, Recommended Project Structure (+5 more)

### Community 32 - "Feature Research"
Cohesion: 0.14
Nodes (13): Add After Validation (v1.x), Anti-Features (Commonly Requested, Often Problematic), Dependency Notes, Differentiators (Competitive Advantage), Feature Dependencies, Feature Landscape, Feature Prioritization Matrix, Feature Research (+5 more)

### Community 33 - "test_grounding.py"
Cohesion: 0.13
Nodes (23): calculate_line_numbers(), find_quote_spans(), Any, Trigger a single targeted re-prompt for a candidate fact whose quote failed…, Calculate 1-indexed (line_start, line_end) for a character span in text., Programmatically verify all candidate facts against the transcript text.…, Remove surrounding quotation marks and outer whitespace., Remove speaker label prefix like 'Client: ' or 'Sarah: ' if present. (+15 more)

### Community 34 - "NexBrief"
Cohesion: 0.17
Nodes (11): Active, Constraints, Context, Core Value, Evolution, Key Decisions, NexBrief, Out of Scope (+3 more)

### Community 35 - "test_api.py"
Cohesion: 0.24
Nodes (10): TestClient, End-to-end integration and API tests for NexBrief backend., Test that posting a transcript to a non-existent project returns 404., Test Project creation, retrieval, listing, update, and deletion., Test transcript creation, normalization, retrieval, and project relationship., Test health check endpoint., test_health_check(), test_invalid_project_transcript_ingestion() (+2 more)

### Community 36 - "Pitfalls Research"
Cohesion: 0.18
Nodes (10): Critical Pitfalls, "Looks Done But Isn't" Checklist, Pitfall 1: Hallucinated Citations & Fabricated Client Quotes, Pitfall 2: Conflating Client Facts with Consultant/Interviewer Questions, Pitfall 3: Graph State Bloat and Lost In-Memory Checkpoints, Pitfall 4: Groq API Rate Limiting (TPM/RPM) on Multi-Step Graphs, Pitfall-to-Phase Mapping, Pitfalls Research (+2 more)

### Community 37 - "Stack Research"
Cohesion: 0.18
Nodes (10): Alternatives Considered, Core Technologies, Development Tools, Installation, Recommended Stack, Sources, Stack Research, Supporting Libraries (+2 more)

### Community 38 - "Project State"
Cohesion: 0.18
Nodes (10): Accumulated Context, Blockers/Concerns, Current Position, Decisions, Deferred Items, Pending Todos, Performance Metrics, Project Reference (+2 more)

### Community 39 - "Phase 1: Backend Foundation & Persistence - Discussion Log"
Cohesion: 0.22
Nodes (8): API Route Structure & CORS Policy, Automated Testing Strategy, Database Engine & Schema Lifecycle, Deferred Ideas, Folded Todos, Phase 1: Backend Foundation & Persistence - Discussion Log, the agent's Discretion, Transcript Ingestion & Storage Model

### Community 40 - "conftest.py"
Cohesion: 0.22
Nodes (10): client_fixture(), fixture, listens_for, Session, TestClient, Enforce foreign keys in SQLite test engine., Provide a clean isolated in-memory database session for each test., Provide a TestClient with the database session dependency overridden. (+2 more)

### Community 41 - "Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas, Verification

### Community 42 - "Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification, Verification

### Community 43 - "database.py"
Cohesion: 0.07
Nodes (29): get_db(), Session, FastAPI dependency injection utilities., Provide a database session dependency for route handlers., health_check(), get, Verify service availability., BaseModel (+21 more)

### Community 44 - "Phase 2: Extraction & Grounding Engine - Research"
Cohesion: 0.10
Nodes (20): Architectural Responsibility Map, Architecture Patterns, Common Pitfalls, Core, Data Flow Diagram, Deferred Ideas (OUT OF SCOPE), Locked Decisions, Phase 2: Extraction & Grounding Engine - Research (+12 more)

### Community 45 - "Phase 2: Extraction & Grounding Engine - Context"
Cohesion: 0.11
Nodes (17): Canonical References, Deferred Ideas, Epistemic Data Schemas & UI Grounding Metadata, Established Patterns, Existing Backend Infrastructure, Existing Code Insights, Folded Todos, Groq Model Selection & LLM Parameters (+9 more)

### Community 49 - "Phase 3: Contradiction Detection & Follow-up Questions - Context"
Cohesion: 0.12
Nodes (16): Canonical References, Contradiction Data Model & Grounding, Deferred Ideas, Established Patterns, Existing Code Insights, Folded Todos, Implementation Decisions, Integration Points (+8 more)

### Community 50 - "services/extraction.py"
Cohesion: 0.22
Nodes (11): get_checkpointer(), Any, Extract filesystem path from a sqlite URL (e.g., sqlite:///path -> path)., Yields active checkpointer, defaulting to SqliteSaver for settings.database_url., Executes the two-node extraction and truth-grounding LangGraph pipeline (D-26).…, _resolve_sqlite_path(), run_extraction_pipeline(), normalize_transcript_text() (+3 more)

### Community 51 - "Graph Report - nex-brief  (2026-09-09)"
Cohesion: 0.18
Nodes (10): Community Hubs (Navigation), Corpus Check, God Nodes (most connected - your core abstractions), Graph Freshness, Graph Report - nex-brief  (2026-09-09), Import Cycles, Knowledge Gaps, Suggested Questions (+2 more)

### Community 52 - "Phase 3: Contradiction Detection & Follow-up Questions - Research"
Cohesion: 0.20
Nodes (9): 1. Contradiction Detection via Groq Structured Outputs, 2. Follow-up Question Ranking Heuristic (CLARIFY-01), 3. LangGraph 4-Node Pipeline Flow, Architectural Responsibility Map, Deferred Ideas (OUT OF SCOPE), Locked Decisions, Phase 3: Contradiction Detection & Follow-up Questions - Research, Technical Analysis & Patterns (+1 more)

### Community 53 - "Phase 2: Extraction & Grounding Engine Verification Report"
Cohesion: 0.22
Nodes (8): Anti-Patterns Found, Goal Achievement, Human Verification Required, Key Link Verification, Observable Truths, Phase 2: Extraction & Grounding Engine Verification Report, Required Artifacts, Requirements Coverage

### Community 54 - "Phase 2: Extraction & Grounding Engine - Discussion Log"
Cohesion: 0.25
Nodes (7): Deferred Ideas, Epistemic Data Schemas & UI Grounding Metadata, Groq Model Selection & LLM Parameters, LangGraph State & Node Pipeline Design, Phase 2: Extraction & Grounding Engine - Discussion Log, the agent's Discretion, Verbatim Quote Verification & Hallucination Recovery

### Community 55 - "Phase 02 — Validation Strategy"
Cohesion: 0.25
Nodes (7): Manual-Only Verifications, Per-Task Verification Map, Phase 02 — Validation Strategy, Sampling Rate, Test Infrastructure, Validation Sign-Off, Wave 0 Requirements

### Community 56 - "Goal Achievement"
Cohesion: 0.25
Nodes (7): Anti-Patterns Found, Goal Achievement, Human Verification Required, Observable Truths, Phase 3: Contradiction Detection & Follow-up Questions Verification Report, Required Artifacts, Requirements Coverage

### Community 57 - "Phase 3: Contradiction Detection & Follow-up Questions - Discussion Log"
Cohesion: 0.29
Nodes (6): Contradiction Data Model & Grounding, Deferred Ideas, Graph Integration & Node Placement, Phase 3: Contradiction Detection & Follow-up Questions - Discussion Log, Question Ranking & Prioritization Strategy, the agent's Discretion

### Community 58 - "Phase 03 — Validation Strategy"
Cohesion: 0.29
Nodes (6): Manual-Only Verifications, Per-Task Verification Map, Phase 03 — Validation Strategy, Sampling Rate, Test Infrastructure, Wave 0 Requirements

### Community 59 - "Phase 2 Plan 02-01 Summary: Epistemic Schemas & Groq LLM Client"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 2 Plan 02-01 Summary: Epistemic Schemas & Groq LLM Client, Verification

### Community 60 - "Phase 2 Plan 02-02 Summary: Verbatim Grounding Verifier & LangGraph Pipeline"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 2 Plan 02-02 Summary: Verbatim Grounding Verifier & LangGraph Pipeline, Verification

### Community 61 - "clear_mock_clarification_client"
Cohesion: 0.50
Nodes (4): clear_mock_clarification_client(), Clear the mock clarification client., clean_mock(), fixture

## Knowledge Gaps
- **390 isolated node(s):** `backend`, `eslintConfig`, `nextConfig`, `name`, `version` (+385 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Project` connect `Project` to `models/extraction.py`, `conftest.py`, `database.py`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Transcript` connect `Project` to `models/extraction.py`, `conftest.py`, `database.py`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `FactCategory` connect `models/extraction.py` to `test_grounding.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `FactCategory` (e.g. with `verify_grounding()` and `test_clarification_heuristic_ranking_order()`) actually correct?**
  _`FactCategory` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `ExtractionState` (e.g. with `build_extraction_graph()` and `detect_contradictions_node()`) actually correct?**
  _`ExtractionState` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `RawExtractionPayload` (e.g. with `get_structured_extraction_client()` and `ExtractionState`) actually correct?**
  _`RawExtractionPayload` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `generate_clarifications_node()` (e.g. with `build_extraction_graph()` and `_score_candidate()`) actually correct?**
  _`generate_clarifications_node()` has 10 INFERRED edges - model-reasoned connections that need verification._