---
title: Setup FastAPI, LangGraph, and Groq in Backend
date: 2026-09-09
priority: high
---

# Setup FastAPI, LangGraph, and Groq in Backend

## Context
Prepare the Python backend environment with necessary dependencies and database structures for NexBrief.

## Tasks
- [ ] Add dependencies to `backend/pyproject.toml`:
  - `fastapi`, `uvicorn[standard]`
  - `langchain`, `langgraph`, `langchain-groq`
  - `sqlmodel`, `pydantic`
  - `python-dotenv`
- [ ] Initialize SQLModel database engine and tables (`Project`, `Transcript`, `ExtractionState`, `Brief`, `CorrectionLog`).
- [ ] Configure Groq client setup (`GROQ_API_KEY` via environment variable).
- [ ] Create initial FastAPI server with health check and project management routes.
