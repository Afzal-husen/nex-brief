# Phase 2: Extraction & Grounding Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 2-Extraction & Grounding Engine
**Areas discussed:** Groq Model Selection & LLM Parameters, Verbatim Quote Verification & Hallucination Recovery, Epistemic Data Schemas & UI Grounding Metadata, LangGraph State & Node Pipeline Design

---

## Groq Model Selection & LLM Parameters

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) llama-3.3-70b-versatile with fallback to 8b on rate limits | Best extraction reasoning and adherence to verbatim quoting, with resilient fallback | ✓ |
| llama-3.3-70b-versatile only | Strictly highest accuracy, fail with clear error if Groq limits hit | |
| llama-3.1-8b-instant | Prioritize ultra-fast response times and minimal token usage | |

**User's choice:** `(Recommended) llama-3.3-70b-versatile with fallback to 8b on rate limits`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) temperature=0.0 | Strictly deterministic to maximize exact verbatim quote reproduction and JSON schema compliance | ✓ |
| Configurable by step | temperature=0.0 for fact/quote extraction, temperature=0.2 for inference & unknown gap generation | |
| temperature=0.1 across all extraction tasks | Slight sampling flexibility for natural phrasing in deductions | |

**User's choice:** `(Recommended) temperature=0.0`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Mock fixtures for unit tests + optional live integration tests | Offline hermetic unit tests with realistic canned LLM responses; live Groq tests run only if GROQ_API_KEY is present | ✓ |
| Strict mock-only in automated test suite | Zero external network calls during pytest, mock LLM client responses deterministically | |
| Always require valid GROQ_API_KEY | Tests fail if real Groq credentials are not provided | |

**User's choice:** `(Recommended) Mock fixtures for unit tests + optional live integration tests`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) 30s timeout with exponential backoff retry | Up to 3 retries for 429/503 errors; falls back to llama-3.1-8b if 70b rate-limited | ✓ |
| 15s aggressive timeout with immediate 8b fallback on rate limit | Fast response priority | |
| 60s timeout with single retry | Generous window for longer transcripts | |

**User's choice:** `(Recommended) 30s timeout with exponential backoff retry`

---

## Verbatim Quote Verification & Hallucination Recovery

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Single targeted re-prompt for failed quotes, then drop if still invalid | Gives LLM one retry with specific mismatch error before discarding ungrounded facts | ✓ |
| Strict drop and log | Discard any ungrounded fact immediately without re-prompting; fast and zero extra tokens | |
| Raise validation error | Halt graph execution and alert if quotes cannot be anchored | |

**User's choice:** `(Recommended) Single targeted re-prompt for failed quotes, then drop if still invalid`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Normalized text first, fallback to whitespace-collapsed match on normalized text | Robust against subtle LLM newline/space discrepancies while preserving verbatim text integrity | ✓ |
| Strict literal substring on normalized_text only | Zero tolerance for space or line break variations | |
| Match against raw_text | Check against the un-normalized original transcript directly | |

**User's choice:** `(Recommended) Normalized text first, fallback to whitespace-collapsed match on normalized text`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Min ~15 chars / 3 words, Max ~350 chars | Prevents trivial quotes like 'ok' or whole monologue dumps; ensures concise, punchy grounding | |
| No length limits | Accept any verbatim substring as long as it exists in the transcript | ✓ |
| Strict sentence boundary | Quotes must be exactly 1 complete sentence from the transcript | |

**User's choice:** `No length limits (Accept any verbatim substring as long as it exists in the transcript)`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Record all occurrence span offsets as a list `[(start, end), ...]` | Enables UI to highlight all occurrences or jump between them cleanly | ✓ |
| Record primary first occurrence span `(start, end)` | Simplest schema, anchors to the first chronological mention | |
| Require speaker or section context to disambiguate the exact occurrence | Disambiguate context | |

**User's choice:** `(Recommended) Record all occurrence span offsets as a list [(start, end), ...]`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Exclude speaker labels from quote text, store speaker in a dedicated `speaker` field | Clean quote text for UI highlights, while retaining speaker attribution | ✓ |
| Allow speaker prefix inside quote if verbatim | e.g., 'Client: We want Next.js' | |
| Flexible: strip speaker label automatically during substring search if present | Strip prefix on search | |

**User's choice:** `(Recommended) Exclude speaker labels from quote text, store speaker in a dedicated speaker field`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Strictly forbid ellipsis — quotes must be 100% contiguous literal substrings | Maintains absolute epistemic grounding without fuzzy gaps or cherry-picked stitching | ✓ |
| Allow ellipsis '...' with multi-segment verification | Verify each fragment is a contiguous substring and in sequential order | |
| Allow LLM to supply a list of quotes per fact | Multiple statements support it | |

**User's choice:** `(Recommended) Strictly forbid ellipsis — quotes must be 100% contiguous literal substrings`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Retain in state under `unverified_candidates` with reason | Full transparency for debugging and auditing what the LLM tried to extract but couldn't verify | ✓ |
| Discard completely from graph state | Only verified facts remain in state; log warning to backend logger | |
| Store rejected quotes in a separate SQLite audit table | Separate audit table | |

**User's choice:** `(Recommended) Retain in state under unverified_candidates with reason`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Deduplicate identical source quotes, merging into one fact with all occurrence spans | Avoids duplicate UI cards while showing all transcript mentions | ✓ |
| Preserve all extracted fact items as generated by LLM | No automatic merging | |
| Semantic deduplication | LLM merges conceptually identical statements during extraction | |

**User's choice:** `(Recommended) Deduplicate identical source quotes, merging into one fact with all occurrence spans`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Case-sensitive exact match first; if not found, case-insensitive match anchoring to transcript's exact casing | Accommodates capitalization differences like 'Next.js' vs 'next.js' while retrieving true transcript offsets | ✓ |
| Strict case-sensitive only | Exact character-by-character casing required | |
| Case-insensitive always | Ignore casing completely when identifying spans | |

**User's choice:** `(Recommended) Case-sensitive exact match first; if not found, case-insensitive match anchoring to transcript's exact casing`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Targeted correction prompt with `{claim, failed_quote, reason}` asking for exact verbatim quote or explicit `status='unsupported'` | Focused, token-efficient, and cleanly drops items the LLM admits were not stated | ✓ |
| Full transcript re-extraction with negative feedback list | Re-runs full extraction node with previously failed claims noted | |
| Pass failed quotes to an 8b model for rapid location lookup | Rapid lookup | |

**User's choice:** `(Recommended) Targeted correction prompt with {claim, failed_quote, reason} asking for exact verbatim quote or explicit status='unsupported'`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Allow sub-phrases as long as the sub-phrase is a literal contiguous substring | Enables focused extraction of specific claims from compound client sentences | ✓ |
| Require full sentence from start to terminal punctuation | Guarantees full context around the statement | |
| Allow sub-phrase but also store the surrounding sentence as context | Surrounding context stored | |

**User's choice:** `(Recommended) Allow sub-phrases as long as the sub-phrase is a literal contiguous substring`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Allow 0 confirmed facts, complete cleanly and generate an UnknownGap ('Transcript contained no verifiable project requirements') | Permits non-project transcripts without crashing the pipeline | ✓ |
| Raise an exception / error status in graph execution | Halts pipeline if no grounded facts can be extracted | |
| Re-try full extraction once with a broader extraction prompt | Re-try full prompt | |

**User's choice:** `(Recommended) Allow 0 confirmed facts, complete cleanly and generate an UnknownGap ('Transcript contained no verifiable project requirements')`

---

## Epistemic Data Schemas & UI Grounding Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Standardized Category Enum (`scope`, `timeline`, `budget`, `tech_stack`, `target_audience`, `constraints`, `integrations`, `other`) | Enables structured UI filtering and feeds directly into brief section generation | ✓ |
| Open-ended category string | LLM dynamically names the topic/category | |
| No category classification | Keep schema minimal with statement, quote, and epistemic type only | |

**User's choice:** `(Recommended) Standardized Category Enum (scope, timeline, budget, tech_stack, target_audience, constraints, integrations, other)`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Grounding linkage: `source_fact_ids: list[str]` + `rationale: str` | Transparent epistemic provenance: shows exactly which confirmed facts led to the deduction and why | ✓ |
| Textual rationale only: `rationale: str` without linking back to specific fact IDs | Simpler schema, LLM describes motivation in prose | |
| Link to quote excerpts directly: `supporting_quotes: list[str]` + `rationale: str` | Link to quotes | |

**User's choice:** `(Recommended) Grounding linkage: source_fact_ids: list[str] + rationale: str`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) `impact_level: 'high' | 'medium' | 'low'` + `missing_information: str` + `suggested_question: str` | Flags scoping risk severity and directly feeds Phase 3 follow-up question generation | ✓ |
| `missing_information: str` + category only | Minimal representation, leaves prioritization to downstream phase | |
| Detailed risk impact matrix with financial/timeline risk indicators | Risk indicators | |

**User's choice:** `(Recommended) impact_level: 'high' | 'medium' | 'low' + missing_information: str + suggested_question: str`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Structured `spans: list[QuoteSpan]` with `start_char`, `end_char`, `line_start`, and `line_end` | Enables exact inline text highlighting plus instant auto-scrolling to the target line in UI-03 | ✓ |
| Tuple offsets `offsets: list[tuple[int, int]]` only | Simple start/end character offsets, let UI calculate line numbers | |
| Line numbers only `line_start` and `line_end` | Highlights whole lines in the transcript viewer | |

**User's choice:** `(Recommended) Structured spans: list[QuoteSpan] with start_char, end_char, line_start, and line_end`

---

## LangGraph State & Node Pipeline Design

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Two-node pipeline: `extract_knowledge` -> `verify_grounding` | Clean separation of concerns: LLM extraction output is separated from deterministic Python quote verification and retry logic | ✓ |
| Three-node pipeline: `extract_facts` -> `extract_inferences_and_gaps` -> `verify_grounding` | Separates fact grounding completely from deduction steps | |
| Single monolithic node: `extract_and_verify` | Everything contained inside a single graph node | |

**User's choice:** `(Recommended) Two-node pipeline: extract_knowledge -> verify_grounding`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) `TypedDict` with nested Pydantic models for items | Idiomatic LangGraph standard, flexible state updates, high serialization compatibility | ✓ |
| `pydantic.BaseModel` for the entire graph state | Strict validation across every state transition | |
| `dataclass` state definition | Python dataclass | |

**User's choice:** `(Recommended) TypedDict with nested Pydantic models for items`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Linear graph flow: handle single targeted retry internally within `verify_grounding` | Keeps Phase 2 graph DAG simple and deterministic without cyclical state transitions | ✓ |
| Cyclical graph edge: `verify_grounding` -> conditional edge -> `correct_quotes` -> `verify_grounding` -> END | Explicit graph cycle for LLM retries | |
| Return immediately without retry, delegating all quote corrections to Phase 4 human gate | Defer to Phase 4 | |

**User's choice:** `(Recommended) Linear graph flow: handle single targeted retry internally within verify_grounding`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Return typed extraction result from compiled graph + support SQLite checkpointer for persistence | Prepares the graph for durable checkpointer while returning the full verified epistemic payload | ✓ |
| Create SQLModel database tables now for Fact, Inference, Gap and store them in SQLite immediately | Relational tables now | |
| In-memory graph compilation for Phase 2 | Focus purely on extraction logic and unit testing, leave persistence wiring to Phase 4 | |

**User's choice:** `(Recommended) Return typed extraction result from compiled graph + support SQLite checkpointer for persistence`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Single unified extraction call with `with_structured_output(ExtractionResult)` | Fastest, lowest latency ~1-2s on Groq, captures facts, inferences, and gaps in a single cohesive pass | ✓ |
| Two sequential LLM calls: Call 1 for facts + quotes, Call 2 for inferences + gaps based on extracted facts | Stricter sequential dependency | |
| Unified call with dynamically loaded few-shot discovery call examples in system prompt | Dynamic examples | |

**User's choice:** `(Recommended) Single unified extraction call with with_structured_output(ExtractionResult)`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Single-pass processing up to 60k tokens | Covers virtually all discovery calls up to ~2 hours without chunk boundary fragmentation | ✓ |
| Sliding window chunker with overlapping boundaries | Splits long transcripts and merges facts across chunks | |
| Strict hard character limit of 50,000 chars (~10,000 words) with error if exceeded | Hard limit | |

**User's choice:** `(Recommended) Single-pass processing up to 60k tokens`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) `SqliteSaver.from_conn_string(settings.database_url)` with thread_id = `transcript_id` | Matches existing SQLite architecture from Phase 1, stores state durable across server restarts | ✓ |
| Use `MemorySaver` during Phase 2 unit tests, allow configurable `SqliteSaver` in production graph builder | In-memory for tests | |
| Separate checkpointer database file `backend/data/checkpoints.db` to avoid lock contention with SQLModel tables | Separate database file | |

**User's choice:** `(Recommended) SqliteSaver.from_conn_string(settings.database_url) with thread_id = transcript_id`

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Service function `run_extraction_pipeline(transcript_id, transcript_text)` in `app/services/extraction.py` | Clean functional interface wrapping graph invocation, checkpointer configuration, and output validation | ✓ |
| Export compiled `extraction_graph` directly from `app/graph/extraction.py` for direct caller `.invoke()` usage | Export graph | |
| Class-based service `ExtractionService` with dependency injection for LLM client and checkpointer | Class service | |

**User's choice:** `(Recommended) Service function run_extraction_pipeline(transcript_id, transcript_text) in app/services/extraction.py`

---

## the agent's Discretion

None — all decisions were explicitly reviewed and confirmed with the user.

## Deferred Ideas

None — all decisions strictly aligned with Phase 2 scope. Contradiction detection remains deferred to Phase 3 (EXTRACT-05).
