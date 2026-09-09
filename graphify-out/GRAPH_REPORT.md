# Graph Report - nex-brief  (2026-09-09)

## Corpus Check
- 61 files · ~51,859 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 514 nodes · 571 edges · 49 communities (44 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58efabb1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User Stories
- devDependencies
- compilerOptions
- package.json
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
- Communities (27 total, 4 thin omitted)
- AGENTS.md
- Implications for Roadmap
- Phase 1: Backend Foundation & Persistence - Context
- Phase Details
- v1 Requirements
- Architecture Research
- Feature Research
- create_project
- NexBrief
- test_api.py
- Pitfalls Research
- Stack Research
- Project State
- Phase 1: Backend Foundation & Persistence - Discussion Log
- client_fixture
- Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas
- Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification
- health_check
- set_sqlite_pragma
- set_sqlite_pragma
- app/__init__.py

## God Nodes (most connected - your core abstractions)
1. `Communities (27 total, 4 thin omitted)` - 21 edges
2. `Project` - 19 edges
3. `compilerOptions` - 16 edges
4. `User Stories` - 15 edges
5. `Transcript` - 14 edges
6. `Implications for Roadmap` - 12 edges
7. `Phase Details` - 11 edges
8. `Graph Report - nex-brief  (2026-09-09)` - 11 edges
9. `create_transcript()` - 8 edges
10. `NexBrief` - 8 edges

## Surprising Connections (you probably didn't know these)
- `create_project()` --uses--> `Project`  [INFERRED]
  backend/app/api/projects.py → backend/app/models/project.py
- `create_project()` --uses--> `ProjectCreate`  [INFERRED]
  backend/app/api/projects.py → backend/app/models/project.py
- `list_projects()` --uses--> `Project`  [INFERRED]
  backend/app/api/projects.py → backend/app/models/project.py
- `get_project()` --uses--> `Project`  [INFERRED]
  backend/app/api/projects.py → backend/app/models/project.py
- `delete_project()` --uses--> `Project`  [INFERRED]
  backend/app/api/projects.py → backend/app/models/project.py

## Import Cycles
- None detected.

## Communities (49 total, 5 thin omitted)

### Community 0 - "User Stories"
Cohesion: 0.10
Nodes (19): 10. Create a Project Brief, 11. Review the Brief, 12. Edit the Brief, 13. Approve the Brief, 14. Learn From Corrections, 1. Create a Project, 2. Add a Discovery Call, 3. Understand the Client (+11 more)

### Community 1 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 3 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, next, react, react-dom, name, private, scripts, build (+7 more)

### Community 4 - "Project"
Cohesion: 0.06
Nodes (61): get_db(), Session, FastAPI dependency injection utilities., Provide a database session dependency for route handlers., Update project metadata., update_project(), create_transcript(), get_transcript() (+53 more)

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

### Community 25 - "Communities (27 total, 4 thin omitted)"
Cohesion: 0.06
Nodes (31): Communities (27 total, 4 thin omitted), Community 0 - "User Stories", Community 10 - "Codebase Structure", Community 11 - "layout.tsx", Community 12 - "Testing Patterns", Community 13 - "LangGraph Workflow Specification", Community 14 - "frontend/README.md", Community 15 - "NexBrief Agent Architecture Decisions" (+23 more)

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

### Community 33 - "create_project"
Cohesion: 0.18
Nodes (12): create_project(), delete_project(), get_project(), list_projects(), get, post, Session, Create a new project container. (+4 more)

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

### Community 40 - "client_fixture"
Cohesion: 0.33
Nodes (7): client_fixture(), Session, TestClient, Provide a clean isolated in-memory database session for each test., Provide a TestClient with the database session dependency overridden., session_fixture(), fixture

### Community 41 - "Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 1 Plan 01-01 Summary: Backend Environment, Database & Schemas, Verification

### Community 42 - "Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification"
Cohesion: 0.40
Nodes (4): Key Changes, Overview, Phase 1 Plan 01-02 Summary: Transcript Normalization, REST API Endpoints & Verification, Verification

### Community 43 - "health_check"
Cohesion: 0.67
Nodes (3): health_check(), get, Verify service availability.

### Community 44 - "set_sqlite_pragma"
Cohesion: 0.67
Nodes (3): listens_for, Enforce WAL mode and busy timeout for concurrent access., set_sqlite_pragma()

### Community 45 - "set_sqlite_pragma"
Cohesion: 0.67
Nodes (3): listens_for, Enforce foreign keys in SQLite test engine., set_sqlite_pragma()

## Knowledge Gaps
- **285 isolated node(s):** `backend`, `eslintConfig`, `nextConfig`, `name`, `version` (+280 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Project` connect `Project` to `create_project`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `Project` (e.g. with `create_project()` and `delete_project()`) actually correct?**
  _`Project` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Transcript` (e.g. with `create_transcript()` and `get_transcript()`) actually correct?**
  _`Transcript` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `backend`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _285 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User Stories` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._