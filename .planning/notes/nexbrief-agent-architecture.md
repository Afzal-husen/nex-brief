---
title: NexBrief Agent Architecture Decisions
date: 2026-09-09
context: Initial exploration of NexBrief AI agent pipeline based on product_requirements.md
---

# NexBrief Agent Architecture Decisions

## Summary
NexBrief transforms discovery call conversations into structured, actionable project briefs. Crucially, it acts as an epistemic partner that clearly differentiates between client-stated facts, AI inferences, unknowns, and contradictions.

## Technical Decisions

1. **Ingestion Model:**
   - Pre-transcribed text input via copy-paste or text file upload (.txt, .md, .vtt).
   - Audio/speech-to-text is deferred post-MVP to minimize latency and dependency complexity.

2. **Extraction & Grounding Strategy:**
   - Deterministic extraction pipeline using Pydantic schemas.
   - Verbatim quote anchoring: extracted points reference exact phrases/excerpts from the transcript to power UI verification and click-to-highlight.

3. **Orchestration Framework:**
   - **LangChain & LangGraph**: Manages state transitions, structured tool invocations, and explicit human-in-the-loop interruption points.
   - State graph persists intermediate representations (confirmed, inferred, unknown, contradictions, questions).

4. **LLM Provider:**
   - **Groq** via `langchain-groq`: Delivers ultra-low latency token generation (running high-capacity models like Llama 3.3 70B) for multi-step extractions and brief synthesis without frustrating delays.

5. **Persistence & Backend:**
   - **FastAPI** web framework providing clean REST APIs for the Next.js frontend.
   - **SQLite** database managed via **SQLModel / SQLAlchemy** for zero-configuration, reliable local persistence of projects, transcripts, analysis states, and user corrections (Story 14).
