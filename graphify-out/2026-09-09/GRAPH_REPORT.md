# Graph Report - nex-brief  (2026-09-09)

## Corpus Check
- 24 files · ~4,942 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 172 nodes · 149 edges · 25 communities (21 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a47c7177`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User Stories
- devDependencies
- compilerOptions
- package.json
- include
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `User Stories` - 15 edges
3. `include` - 7 edges
4. `Architecture` - 7 edges
5. `Codebase Concerns` - 7 edges
6. `Technology Stack` - 7 edges
7. `Coding Conventions` - 6 edges
8. `External Integrations` - 6 edges
9. `Codebase Structure` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (25 total, 4 thin omitted)

### Community 0 - "User Stories"
Cohesion: 0.10
Nodes (19): 10. Create a Project Brief, 11. Review the Brief, 12. Edit the Brief, 13. Approve the Brief, 14. Learn From Corrections, 1. Create a Project, 2. Add a Discovery Call, 3. Understand the Client (+11 more)

### Community 1 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 2 - "compilerOptions"
Cohesion: 0.11
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 3 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, next, react, react-dom, name, private, scripts, build (+7 more)

### Community 4 - "include"
Cohesion: 0.20
Nodes (9): exclude, include, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+1 more)

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

## Knowledge Gaps
- **115 isolated node(s):** `backend`, `eslintConfig`, `nextConfig`, `name`, `version` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `compilerOptions` to `include`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `backend`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User Stories` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._