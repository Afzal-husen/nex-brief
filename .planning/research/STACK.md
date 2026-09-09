# Stack Research

**Domain:** AI-Powered Discovery Call Analysis & Project Brief Synthesis
**Researched:** 2026-09-09
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Python | 3.14 (or >=3.11) | Backend runtime | Native support for modern typing, async, and current AI/ML orchestration libraries |
| FastAPI | ^0.115.0 | REST API framework | High-performance ASGI framework with native OpenAPI schema generation and Pydantic v2 validation |
| LangGraph | ^0.2.70 | State graph orchestration | Explicit state management, cycle support, human-in-the-loop interrupts, and checkpointing |
| LangChain Core | ^0.3.40 | Base abstractions & schemas | Standard interface for prompts, output parsers, and tool invocation |
| langchain-groq | ^0.2.5 | Fast LLM inference client | Ultra-low latency inference via Groq cloud running Llama 3.3 70B Versatile, critical for multi-step graph nodes |
| SQLModel | ^0.0.22 | ORM & data modeling | Bridges Pydantic v2 and SQLAlchemy seamlessly, eliminating duplicate model definitions |
| SQLite | 3.x | Persistent local storage | Zero-configuration file database ideal for single-operator local app with WAL mode enabled |
| Next.js | 16.3.4 | Frontend App Router framework | Server/client components, optimized bundling, responsive UI |
| React | 19.2.8 | UI component library | Concurrent rendering and modern state hooks |
| Tailwind CSS | 4.x | Utility-first styling engine | Clean, maintainable design system styling |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pydantic | ^2.10.0 | Data contracts & validation | Typed schemas for extraction outputs, brief sections, and API payloads |
| uvicorn | ^0.34.0 | ASGI web server | Running and serving the FastAPI backend |
| python-dotenv | ^1.0.1 | Configuration management | Loading `.env` keys (e.g. `GROQ_API_KEY`) safely |
| pytest | ^8.3.0 | Backend testing | Unit and integration test suite for graph nodes and endpoints |
| httpx | ^0.28.0 | Async HTTP client | Testing FastAPI test client and external network calls |
| lucide-react | ^0.475.0 | Iconography | Visual cues for confirmed, inferred, unknown, and contradiction states |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ruff | Python linter and formatter | Extremely fast linting and code formatting |
| npm / tsc | Frontend build and typecheck | Ensures zero TypeScript regression in frontend |

## Installation

```bash
# Backend (in backend/ directory with active venv)
pip install "fastapi>=0.115.0" "uvicorn[standard]>=0.34.0" "langgraph>=0.2.70" "langchain-core>=0.3.40" "langchain-groq>=0.2.5" "sqlmodel>=0.0.22" "pydantic>=2.10.0" "python-dotenv>=1.0.1"
pip install -D "pytest>=8.3.0" "pytest-asyncio>=0.24.0" "httpx>=0.28.0" "ruff"

# Frontend (in frontend/ directory)
npm install lucide-react
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| LangGraph | AutoGen / CrewAI | Use AutoGen/CrewAI for conversational multi-agent social simulations. LangGraph is far superior for deterministic DAGs with explicit human approval gates. |
| Groq (Llama 3.3 70B) | OpenAI GPT-4o | Use GPT-4o if multi-modal vision or proprietary embeddings are strictly required. Groq is preferred here for sub-second token latency across multi-step chains. |
| SQLite (SQLModel) | PostgreSQL | Use PostgreSQL if scaling to multi-tenant cloud SaaS with concurrent write transactions. SQLite is zero-friction for local MVP. |
| FastAPI | Flask / Django | Use Django if full admin batteries-included needed. FastAPI provides modern async and automated Pydantic schema validation. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| LangChain v0.1 legacy chains (`LLMChain`, `ConversationalRetrievalChain`) | Deprecated, brittle, hard to debug, black-box state | LangGraph state graph with standard `@tool` / LCEL primitives |
| Unstructured raw string LLM output | Hallucinations, formatting drift, impossible to anchor citations | Pydantic schemas with `with_structured_output` |
| Client-side LLM calls | Exposes API keys, introduces network overhead, breaks persistence | Backend FastAPI API proxying LangGraph execution |
| Heavy audio STT models locally (Whisper large) | Multi-gigabyte dependency overhead, CUDA requirement, high latency | Pre-transcribed text input for MVP |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Pydantic ^2.10 | SQLModel ^0.0.22 | SQLModel v0.0.22+ supports Pydantic v2 without namespace collisions |
| LangGraph ^0.2.70 | LangChain Core ^0.3.40 | Ensure compatible v0.3 ecosystem packages |
| Python 3.14 | FastAPI / Uvicorn | Python 3.14 is installed locally; ensure C-extension packages compile cleanly or use pre-built wheels |

## Sources

- LangGraph official documentation (`langchain-ai.github.io/langgraph/`)
- Groq Cloud API reference (`console.groq.com/docs`)
- SQLModel documentation (`sqlmodel.tiangolo.com`)
- FastAPI documentation (`fastapi.tiangolo.com`)

---
*Stack research for: NexBrief*
*Researched: 2026-09-09*
