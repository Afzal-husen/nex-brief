# Graph Report - nex-brief  (2026-09-09)

## Corpus Check
- 168 files · ~305,211 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1313 nodes · 2208 edges · 105 communities (95 shown, 10 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67915366`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User Stories
- devDependencies
- compilerOptions
- ExtractionState
- Project
- Architecture
- Codebase Concerns
- Technology Stack
- Coding Conventions
- External Integrations
- Codebase Structure
- ProjectGrid.tsx
- Testing Patterns
- LangGraph Workflow Specification
- frontend/README.md
- NexBrief Agent Architecture Decisions
- Evaluation Dataset from User Corrections
- Setup FastAPI, LangGraph, and Groq in Backend
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Phase 7: Frontend API Client & Project Dashboard - Context
- backend
- Communities (101 total, 8 thin omitted)
- AGENTS.md
- Implications for Roadmap
- Phase 1: Backend Foundation & Persistence - Context
- Phase Details
- v1 Requirements
- Architecture Research
- Feature Research
- find_quote_spans
- NexBrief
- test_api.py
- Pitfalls Research
- Stack Research
- Project State
- Phase 1: Backend Foundation & Persistence - Discussion Log
- Phase 7 — UI Design Contract
- Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas
- Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification
- database.py
- Phase 2: Extraction & Grounding Engine - Research
- Phase 2: Extraction & Grounding Engine - Context
- app/__init__.py
- Phase 3: Contradiction Detection & Follow-up Questions - Context
- services/workflow.py
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
- Technical Analysis
- Plan 03-01 Summary: Contradiction Detection Node with Verbatim Grounding
- Plan 03-02 Summary: Prioritized Question Generator Node & 4-Node Pipeline Integration
- models/__init__.py
- CorrectionLog
- Phase 7: Frontend API Client & Project Dashboard - Discussion Log
- test_correction_eval.py
- api/workflow.py
- Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Context
- Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Context
- Phase 6: Correction Logging & Evaluation Datasets (Story 14) - Research
- Technical Analysis & Patterns
- Implementation Decisions
- Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Research
- compute_section_diffs
- Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Discussion Log
- Phase 04 — Validation Strategy
- Phase 05 — Validation Strategy
- Success Criteria Verification
- Phase 06 — Validation Strategy
- Success Criteria Verification
- Success Criteria Verification
- Verification Evidence
- Plan 04-01 Summary: Brief Synthesis & Critique Nodes
- Plan 04-02 Summary: 6-Node Pipeline Integration & Durable SQLite Checkpointing
- Plan 05-01 Summary: Brief Record & Analysis Interrupt Endpoint
- Plan 05-02 Summary: Clarification Resumption & Brief Approval Endpoints
- Plan 06-01 Summary: Correction Logging & Evaluation Datasets (Story 14)
- ProjectBriefRecord
- run_export
- eval/__init__.py
- Phase 7: Plan 01 Summary — Typed API Client & UI Primitives
- Phase 7: Plan 02 Summary — Project Dashboard, Modals & Workspace

## God Nodes (most connected - your core abstractions)
1. `Communities (101 total, 8 thin omitted)` - 80 edges
2. `ExtractionState` - 42 edges
3. `FactCategory` - 41 edges
4. `Project` - 33 edges
5. `RawExtractionPayload` - 26 edges
6. `Transcript` - 26 edges
7. `RawFactCandidate` - 23 edges
8. `SectionKeyEnum` - 22 edges
9. `build_extraction_graph()` - 21 edges
10. `generate_clarifications_node()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `ClarifyRequest` --uses--> `UserClarification`  [INFERRED]
  backend/app/api/workflow.py → backend/app/models/brief.py
- `ClarifyResponse` --uses--> `CritiqueReport`  [INFERRED]
  backend/app/api/workflow.py → backend/app/models/brief.py
- `ClarifyResponse` --uses--> `ProjectBrief`  [INFERRED]
  backend/app/api/workflow.py → backend/app/models/brief.py
- `build_extraction_graph()` --indirect_call--> `critique_brief_node()`  [INFERRED]
  backend/app/graph/builder.py → backend/app/graph/nodes/critique_brief.py
- `build_extraction_graph()` --indirect_call--> `synthesize_brief_node()`  [INFERRED]
  backend/app/graph/builder.py → backend/app/graph/nodes/synthesize_brief.py

## Import Cycles
- None detected.

## Communities (105 total, 10 thin omitted)

### Community 0 - "User Stories"
Cohesion: 0.10
Nodes (19): 10. Create a Project Brief, 11. Review the Brief, 12. Edit the Brief, 13. Approve the Brief, 14. Learn From Corrections, 1. Create a Project, 2. Add a Discovery Call, 3. Understand the Client (+11 more)

### Community 1 - "devDependencies"
Cohesion: 0.05
Nodes (38): babel-plugin-react-compiler, eslint, eslint-config-next, dependencies, lucide-react, next, react, react-dom (+30 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 3 - "ExtractionState"
Cohesion: 0.05
Nodes (111): AnalyzeResponse, clear_mock_clarification_client(), clear_mock_contradiction_client(), clear_mock_critique_client(), clear_mock_extraction_client(), clear_mock_synthesis_client(), get_extraction_llm_with_fallback(), get_groq_llm() (+103 more)

### Community 4 - "Project"
Cohesion: 0.05
Nodes (62): get_db(), Session, Provide a database session dependency for route handlers., create_project(), delete_project(), get_project(), list_projects(), get (+54 more)

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

### Community 11 - "ProjectGrid.tsx"
Cohesion: 0.06
Nodes (53): geistMono, geistSans, metadata, ProjectWorkspacePage(), CreateProjectModal(), CreateProjectModalProps, DeleteProjectModal(), DeleteProjectModalProps (+45 more)

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

### Community 22 - "Phase 7: Frontend API Client & Project Dashboard - Context"
Cohesion: 0.11
Nodes (17): Backend Specifications & Contracts, Canonical References, Dashboard Layout & Cards, Data Fetching & Refresh Strategy, Deferred Ideas, Established Patterns, Existing Code Insights, Frontend Architecture & UI Design Guidelines (+9 more)

### Community 25 - "Communities (101 total, 8 thin omitted)"
Cohesion: 0.03
Nodes (80): Communities (101 total, 8 thin omitted), Community 0 - "User Stories", Community 10 - "Codebase Structure", Community 11 - "layout.tsx", Community 12 - "Testing Patterns", Community 13 - "LangGraph Workflow Specification", Community 14 - "frontend/README.md", Community 15 - "NexBrief Agent Architecture Decisions" (+72 more)

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

### Community 33 - "find_quote_spans"
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

### Community 40 - "Phase 7 — UI Design Contract"
Cohesion: 0.18
Nodes (10): Checker Sign-Off, Color, Component Inventory, Copywriting Contract, Design System, Phase 7 — UI Design Contract, Registry Safety, Spacing Scale (+2 more)

### Community 41 - "Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas, Verification

### Community 42 - "Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification, Verification

### Community 43 - "database.py"
Cohesion: 0.07
Nodes (30): FastAPI dependency injection utilities., health_check(), get, Verify service availability., BaseModel, Application Configuration., Settings, get_session() (+22 more)

### Community 44 - "Phase 2: Extraction & Grounding Engine - Research"
Cohesion: 0.10
Nodes (20): Architectural Responsibility Map, Architecture Patterns, Common Pitfalls, Core, Data Flow Diagram, Deferred Ideas (OUT OF SCOPE), Locked Decisions, Phase 2: Extraction & Grounding Engine - Research (+12 more)

### Community 45 - "Phase 2: Extraction & Grounding Engine - Context"
Cohesion: 0.11
Nodes (17): Canonical References, Deferred Ideas, Epistemic Data Schemas & UI Grounding Metadata, Established Patterns, Existing Backend Infrastructure, Existing Code Insights, Folded Todos, Groq Model Selection & LLM Parameters (+9 more)

### Community 49 - "Phase 3: Contradiction Detection & Follow-up Questions - Context"
Cohesion: 0.12
Nodes (16): Canonical References, Contradiction Data Model & Grounding, Deferred Ideas, Established Patterns, Existing Code Insights, Folded Todos, Implementation Decisions, Integration Points (+8 more)

### Community 50 - "services/workflow.py"
Cohesion: 0.20
Nodes (14): get_checkpointer(), Any, Yields active checkpointer, defaulting to SqliteSaver for settings.database_url., normalize_transcript_text(), Normalizes discovery transcript text while strictly preserving: - Verbatim…, get_project_brief_details(), Any, Session (+6 more)

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

### Community 61 - "Technical Analysis"
Cohesion: 0.22
Nodes (8): 1. Backend REST API Contracts, 2. Frontend Dependencies & Tooling, 3. Vercel React Best Practices Integration, 4. UI/UX Pro Max Design System & Tokens, 5. Plan Structure, Phase 7: Frontend API Client & Project Dashboard - Research, Technical Analysis, TypeScript Data Types

### Community 68 - "models/__init__.py"
Cohesion: 0.08
Nodes (57): get_structured_critique_client(), get_structured_synthesis_client(), Returns a client with structured output binding for RawBriefPayload., Returns a client with structured output binding for RawCritiquePayload., Set a mock client for brief synthesis., Set a mock client for critique audit., set_mock_critique_client(), set_mock_synthesis_client() (+49 more)

### Community 69 - "CorrectionLog"
Cohesion: 0.16
Nodes (16): export_evaluation_dataset(), list_corrections(), get, Session, Retrieves stored section-level correction records (EVAL-01)., Exports evaluation benchmark dataset formatted as JSON Lines (JSONL) (EVAL-02 /…, CorrectionLog, SQLModel (+8 more)

### Community 70 - "Phase 7: Frontend API Client & Project Dashboard - Discussion Log"
Cohesion: 0.25
Nodes (7): Dashboard Layout & Cards, Data Fetching & Refresh Strategy, Deferred Ideas, Phase 7: Frontend API Client & Project Dashboard - Discussion Log, Project Creation & Management UX, the agent's Discretion, Visual Style & Theme

### Community 71 - "test_correction_eval.py"
Cohesion: 0.30
Nodes (14): ProjectStatus, approve_project_brief(), Finalizes human approval of brief, optionally saving user edits (BRIEF-04)., client_fixture(), db_session_fixture(), make_sample_brief_dict(), fixture, Path (+6 more)

### Community 72 - "api/workflow.py"
Cohesion: 0.18
Nodes (17): analyze_project(), approve_brief(), ApproveRequest, ApproveResponse, BriefResponse, clarify_project(), ClarifyRequest, ClarifyResponse (+9 more)

### Community 73 - "Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Context"
Cohesion: 0.11
Nodes (17): 11-Section Brief Structure & Section Modeling, Agent's Discretion, Canonical References, Clarifications Integration Strategy, Critique Audit Severity & Feedback Loop, Deferred Ideas, Durable Checkpointing & State Storage, Established Patterns (+9 more)

### Community 74 - "Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Context"
Cohesion: 0.12
Nodes (16): Agent's Discretion, API Route Design & Execution Lifecycle, Canonical References, Deferred Ideas, Error Handling & Concurrency, Established Patterns, Existing Code Insights, Implementation Decisions (+8 more)

### Community 75 - "Phase 6: Correction Logging & Evaluation Datasets (Story 14) - Research"
Cohesion: 0.15
Nodes (12): 1. Technical Stack & Standard Library Utilization, 2. Relational Schema & Persistence Architecture, 3. Evaluation Benchmark Schema (Story 14), 4. API & CLI Architecture, 5. Verification Strategy, CLI Entrypoint (`backend/app/eval/export.py`), `CorrectionLog` Model (`backend/app/models/correction.py`), Format & Fields (+4 more)

### Community 76 - "Technical Analysis & Patterns"
Cohesion: 0.18
Nodes (10): 1. 11-Section Brief Structure & Pydantic Modeling, 2. Synthesis Prompt Architecture & Groq Invocation, 3. Critique Audit Engine (`BRIEF-02`), 4. Durable SQLite Checkpointing (`DATA-04`, `D-13`, `D-14`), Architectural Responsibility Map, Deferred Ideas (OUT OF SCOPE), Locked Decisions, Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Research (+2 more)

### Community 77 - "Implementation Decisions"
Cohesion: 0.18
Nodes (10): Canonical References, Database Schema & Relationship, Diff Engine Architecture & Computation, Evaluation Benchmark Dataset Structure (Story 14), Export Interfaces (REST API & CLI), Implementation Decisions, Phase 6: Correction Logging & Evaluation Datasets (Story 14) - Context, Phase Boundary (+2 more)

### Community 78 - "Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Research"
Cohesion: 0.22
Nodes (8): 1. LangGraph Interrupt & Resume Mechanics, 2. SQLModel Entity: `ProjectBriefRecord`, 3. Endpoint Specifications, Architectural Responsibility Map, Locked Decisions, Phase 5: Workflow REST API & Human-in-the-Loop Endpoints - Research, Technical Analysis & Patterns, User Constraints (from CONTEXT.md)

### Community 79 - "compute_section_diffs"
Cohesion: 0.36
Nodes (7): compute_section_diffs(), compute_unified_diff(), extract_section_text(), Any, Extracts text content for a given section key from a brief dict. Supports both…, Compares all 11 brief sections between draft and approved briefs, producing…, Computes unified diff lines comparing draft to approved content. Returns…

### Community 80 - "Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Discussion Log"
Cohesion: 0.25
Nodes (7): 11-Section Brief Structure & Section Modeling, Agent's Discretion, Clarifications Integration Strategy, Critique Audit Severity & Feedback Loop, Deferred Ideas, Durable Checkpointing & State Storage, Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Discussion Log

### Community 81 - "Phase 04 — Validation Strategy"
Cohesion: 0.25
Nodes (7): Manual-Only Verifications, Per-Task Verification Map, Phase 04 — Validation Strategy, Sampling Rate, Test Infrastructure, Validation Sign-Off, Wave 0 Requirements

### Community 82 - "Phase 05 — Validation Strategy"
Cohesion: 0.25
Nodes (7): Manual-Only Verifications, Per-Task Verification Map, Phase 05 — Validation Strategy, Sampling Rate, Test Infrastructure, Validation Sign-Off, Wave 0 Requirements

### Community 83 - "Success Criteria Verification"
Cohesion: 0.25
Nodes (7): 1. `POST /projects/{id}/analyze` triggers graph execution and halts at clarification breakpoint (`CLARIFY-02`), 2. `POST /projects/{id}/clarify` injects user responses into thread state and resumes graph (`CLARIFY-03`), 3. `GET /projects/{id}/brief` returns the synthesized draft brief and critique report for user review (`BRIEF-03`), 4. `POST /projects/{id}/approve` accepts user edits and transitions status to approved (`BRIEF-04`), Phase 05: Workflow REST API & Human-in-the-Loop Endpoints — Verification, Success Criteria Verification, Test Suite Results

### Community 84 - "Phase 06 — Validation Strategy"
Cohesion: 0.25
Nodes (7): Manual-Only Verifications, Per-Task Verification Map, Phase 06 — Validation Strategy, Sampling Rate, Test Infrastructure, Validation Sign-Off, Wave 0 Requirements

### Community 85 - "Success Criteria Verification"
Cohesion: 0.29
Nodes (6): 1. Synthesis node generates all 11 required sections grounded in confirmed facts and user clarifications (`BRIEF-01`), 2. Critique node audits the brief for unsupported assumptions or missing constraints (`BRIEF-02`), 3. LangGraph checkpoints state to SQLite, allowing resumption across process restarts (`DATA-04`), Phase 04: Brief Synthesis, Critique & Durable Checkpointing — Verification, Success Criteria Verification, Test Suite Results

### Community 86 - "Success Criteria Verification"
Cohesion: 0.29
Nodes (6): 1. Diff engine computes section-level modifications between draft and final brief (`EVAL-01`), 2. Structured diffs are persisted in `correction_log` table upon brief approval (`EVAL-01`), 3. CLI and API export logged corrections as JSONL benchmark datasets (`EVAL-02`), Phase 06: Correction Logging & Evaluation Datasets (Story 14) — Verification, Success Criteria Verification, Test Suite Results

### Community 87 - "Verification Evidence"
Cohesion: 0.25
Nodes (7): 1. TypeScript Strict Type-Checking, 2. ESLint Static Analysis, 3. Production Build Compilation, 4. Backend Regression Suite, Acceptance Criteria Checklist, Phase 7: Verification Report, Verification Evidence

### Community 88 - "Plan 04-01 Summary: Brief Synthesis & Critique Nodes"
Cohesion: 0.50
Nodes (3): Key Changes, Overview, Plan 04-01 Summary: Brief Synthesis & Critique Nodes

### Community 89 - "Plan 04-02 Summary: 6-Node Pipeline Integration & Durable SQLite Checkpointing"
Cohesion: 0.50
Nodes (3): Key Changes, Overview, Plan 04-02 Summary: 6-Node Pipeline Integration & Durable SQLite Checkpointing

### Community 90 - "Plan 05-01 Summary: Brief Record & Analysis Interrupt Endpoint"
Cohesion: 0.50
Nodes (3): Key Changes, Overview, Plan 05-01 Summary: Brief Record & Analysis Interrupt Endpoint

### Community 91 - "Plan 05-02 Summary: Clarification Resumption & Brief Approval Endpoints"
Cohesion: 0.50
Nodes (3): Key Changes, Overview, Plan 05-02 Summary: Clarification Resumption & Brief Approval Endpoints

### Community 92 - "Plan 06-01 Summary: Correction Logging & Evaluation Datasets (Story 14)"
Cohesion: 0.50
Nodes (3): Key Changes, Overview, Plan 06-01 Summary: Correction Logging & Evaluation Datasets (Story 14)

### Community 93 - "ProjectBriefRecord"
Cohesion: 0.47
Nodes (3): ProjectBriefRecord, SQLModel, Persistent relational record for project briefs, critique reports, and human…

### Community 94 - "run_export"
Cohesion: 0.50
Nodes (4): main(), Session, Programmatic entry point for evaluation dataset export. Returns the dataset…, run_export()

## Knowledge Gaps
- **586 isolated node(s):** `backend`, `eslintConfig`, `nextConfig`, `name`, `version` (+581 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Project` connect `Project` to `ExtractionState`, `models/__init__.py`, `CorrectionLog`, `test_correction_eval.py`, `database.py`, `services/workflow.py`, `ProjectBriefRecord`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `ExtractionState` connect `ExtractionState` to `services/workflow.py`, `database.py`, `models/__init__.py`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Communities (101 total, 8 thin omitted)` connect `Communities (101 total, 8 thin omitted)` to `Graph Report - nex-brief  (2026-09-09)`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `ExtractionState` (e.g. with `build_extraction_graph()` and `critique_brief_node()`) actually correct?**
  _`ExtractionState` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `FactCategory` (e.g. with `verify_grounding()` and `test_synthesize_brief_generates_all_11_sections()`) actually correct?**
  _`FactCategory` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `Project` (e.g. with `create_project()` and `delete_project()`) actually correct?**
  _`Project` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `RawExtractionPayload` (e.g. with `get_structured_extraction_client()` and `ExtractionState`) actually correct?**
  _`RawExtractionPayload` has 2 INFERRED edges - model-reasoned connections that need verification._