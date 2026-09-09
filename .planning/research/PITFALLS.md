# Pitfalls Research

**Domain:** AI-Powered Discovery Call Analysis & Project Brief Synthesis
**Researched:** 2026-09-09
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Hallucinated Citations & Fabricated Client Quotes

**What goes wrong:**
The LLM extracts a "confirmed fact" and generates a plausible-sounding quote that was never actually uttered in the transcript. The user trusts the "quote", leading to flawed requirements.

**Why it happens:**
Generative models tend to paraphrase rather than extract verbatim character strings when asked to summarize.

**How to avoid:**
Implement a programmatic validation step in Python: `assert quote in transcript_text`. If the quote does not appear verbatim as a contiguous substring in the transcript, reject it or fail extraction validation.

**Warning signs:**
Quotes that sound overly polished, grammatically complete, or lack verbal filler ("um", "like", "you know") present in raw audio transcripts.

**Phase to address:**
Phase 2 (LangGraph Extraction Core).

---

### Pitfall 2: Conflating Client Facts with Consultant/Interviewer Questions

**What goes wrong:**
The interviewer asks: *"Would you want this to integrate with Salesforce?"* and the LLM extracts: *"Client requires Salesforce integration."*

**Why it happens:**
Transcript lacks speaker identification or the model fails to track who said what in dialog turns.

**How to avoid:**
Instruct the prompt and extraction schema to explicitly account for speaker turns, or extract the speaker name for each quote. Add a verification heuristic distinguishing interviewer propositions from client affirmations.

**Warning signs:**
Features suggested by the sales rep appearing as client "pain points".

**Phase to address:**
Phase 2 (LangGraph Extraction Core).

---

### Pitfall 3: Graph State Bloat and Lost In-Memory Checkpoints

**What goes wrong:**
LangGraph pipeline state is held only in Python memory. If the backend server restarts during a human review interrupt, the entire analysis progress is lost.

**Why it happens:**
Relying on `MemorySaver` instead of a durable SQLite or persistent checkpointer in LangGraph.

**How to avoid:**
Use `SqliteSaver` or persist the state dictionary into SQLModel tables at each interrupt boundary.

**Warning signs:**
API errors stating "thread_id not found" after backend restart or code reload.

**Phase to address:**
Phase 1 & Phase 3 (State Checkpointing & API Endpoints).

---

### Pitfall 4: Groq API Rate Limiting (TPM/RPM) on Multi-Step Graphs

**What goes wrong:**
Running multiple complex extraction and synthesis nodes in quick succession hits Groq's tokens-per-minute (TPM) or requests-per-minute (RPM) limits on free or tier-1 developer accounts.

**Why it happens:**
Sending full transcripts (~5,000–10,000 words) repeatedly across 4 or 5 parallel nodes in seconds.

**How to avoid:**
Batch extractions into a single structured pass where possible, configure backoff/retry with jitter in `langchain-groq`, and reuse intermediate state rather than re-sending the raw transcript in downstream nodes.

**Warning signs:**
HTTP 429 Too Many Requests errors during graph execution.

**Phase to address:**
Phase 2 & Phase 4 (LLM Integration & Synthesis).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| In-memory state without DB persistence | Quick setup for initial demo | User loses work on page refresh or server restart | Never in production; only acceptable in unit tests |
| Single monolithic prompt doing all 11 sections | Fewer LLM calls | High hallucination rate, lack of grounding, unparseable output | Never; break down into extract -> clarify -> synthesize |
| Hardcoded sample transcripts | Fast UI prototyping | Hides edge cases like messy timestamps or bad punctuation | Acceptable only in frontend mock mode |

## "Looks Done But Isn't" Checklist

- [ ] **Fact Extraction:** Often claims to be verbatim — verify `quote in transcript` programmatic check is active.
- [ ] **Human Interrupt:** Often tested synchronously — verify the graph can be resumed hours later across a fresh HTTP request using `thread_id`.
- [ ] **Brief Generation:** Often omits "Out of Scope" or "Risks" — verify all 11 required sections exist in output Pydantic model.
- [ ] **Correction Logging (Story 14):** Often forgets to capture the user's edits — verify that differences between draft and approved brief are stored in `CorrectionLog`.

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unanchored / fabricated quotes | Phase 2 (Extraction Pipeline) | Unit test asserting string inclusion in source transcript |
| Conflating interviewer and client statements | Phase 2 (Extraction Pipeline) | Test cases with interviewer leading questions |
| Ephemeral state loss on server reload | Phase 3 (API & Checkpointing) | Integration test restarting app between interrupt and resume |
| Groq rate limits / token saturation | Phase 4 (Prompt Optimization) | Benchmark test with 10k word transcript |
| Missing correction tracking | Phase 5 (Brief Approval & Evals) | Assert row created in `correction_log` table on approval |

## Sources

- LangGraph production guides on state persistence & checkpointing
- Groq Cloud rate limit and model documentation
- LLM hallucination benchmarking studies (RAG & verbatim extraction)

---
*Pitfalls research for: NexBrief*
*Researched: 2026-09-09*
