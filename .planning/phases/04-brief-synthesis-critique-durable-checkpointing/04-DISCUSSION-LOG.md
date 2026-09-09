# Phase 4: Brief Synthesis, Critique & Durable Checkpointing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 04-brief-synthesis-critique-durable-checkpointing
**Areas discussed:** 11-Section Brief Structure & Section Modeling, Critique Audit Severity & Feedback Loop, Clarifications Integration Strategy, Durable Checkpointing & State Storage

---

## 11-Section Brief Structure & Section Modeling

| Option | Description | Selected |
|--------|-------------|----------|
| Strongly typed dictionary of 11 sections | Each section has title, markdown content, and supporting IDs | ✓ |
| Single monolithic markdown document | Predetermined H2 headings | |
| Array of section objects | Dynamic ordering | |

**User's choice:** Strongly typed dictionary of 11 sections
**Notes:** Keys predefined for consistent programmatic access by API and UI.

| Option | Description | Selected |
|--------|-------------|----------|
| Explicitly state "Not discussed in discovery call" | List related open questions/unknowns | ✓ |
| Omit section or leave blank | Empty string | |
| Extrapolate plausible defaults | Inferred guesses | |

**User's choice:** Explicitly state "Not discussed in discovery call"
**Notes:** Preserves epistemic truthfulness without making up missing client requirements.

| Option | Description | Selected |
|--------|-------------|----------|
| Single synthesis prompt with structured output | Specifies all 11 sections at once via Groq | ✓ |
| Multi-step synthesis | Scope first, then technical, then timeline | |
| 11 parallel LLM calls | One per section | |

**User's choice:** Single synthesis prompt with structured output
**Notes:** Fastest latency and best narrative cohesion across sections.

| Option | Description | Selected |
|--------|-------------|----------|
| Dual output: structured sections + full unified markdown | Sections dictionary and compiled string | ✓ |
| Structured sections only | Dynamic frontend compile | |
| Unified markdown only | Regex extraction | |

**User's choice:** Both structured sections and unified markdown export

---

## Critique Audit Severity & Feedback Loop

| Option | Description | Selected |
|--------|-------------|----------|
| Advisory critique notes attached to brief | Never silently alters brief, maintains human editorial authority | ✓ |
| Automated retry loop | Re-synthesize automatically on failure | |
| Strict gate | Error status and block brief delivery | |

**User's choice:** Advisory critique notes attached to brief
**Notes:** Aligns with core product philosophy that the human retains final editorial control.

| Option | Description | Selected |
|--------|-------------|----------|
| Four specific issue types | ungrounded_claim, contradiction_neglect, missing_constraint, vague_deliverable | ✓ |
| Ungrounded claims only | Hallucinations only | |
| Prose and grammar review | General editing | |

**User's choice:** Four specific issue types

| Option | Description | Selected |
|--------|-------------|----------|
| Structured CritiqueReport | Score (0-100), summary, and list of CritiqueIssue items | ✓ |
| Simple string warnings list | Unstructured warnings | |
| Markdown report | Appended to brief | |

**User's choice:** Structured CritiqueReport

| Option | Description | Selected |
|--------|-------------|----------|
| Fast independent LLM call on Groq | Evaluates brief against facts, inferences, contradictions, transcript | ✓ |
| Deterministic Python engine + LLM check | Hybrid approach | |
| Pure deterministic checks | No LLM | |

**User's choice:** Fast independent LLM call on Groq

---

## Clarifications Integration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated UserClarification object | question_id, resolved_text, resolved_by | ✓ |
| Simple key-value dict | question_id: answer_text | |
| Append directly as ConfirmedFact | Merged directly | |

**User's choice:** Dedicated UserClarification object

| Option | Description | Selected |
|--------|-------------|----------|
| Distinct prompt block | Labeled 'USER CLARIFICATIONS & RESOLUTIONS' as authoritative facts | ✓ |
| Merge seamlessly into facts | Undifferentiated in prompt | |
| Brief addendum at end | Trailing note | |

**User's choice:** Distinct prompt block

| Option | Description | Selected |
|--------|-------------|----------|
| Synthesize normally with available facts | Surface unresolved gaps in Section 8 & 11 | ✓ |
| Halt or raise error | Require answers | |
| Fill with conservative placeholders | Default values | |

**User's choice:** Synthesize normally with available facts

| Option | Description | Selected |
|--------|-------------|----------|
| Explicitly track supporting_clarification_ids in section | Alongside source_fact_ids | ✓ |
| Inline footnote references | Markdown syntax | |
| Global brief metadata only | Not per-section | |

**User's choice:** Explicitly track supporting_clarification_ids in section

---

## Durable Checkpointing & State Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated checkpoints table inside SQLite database | Managed by SqliteSaver | ✓ |
| Same nexbrief.db SQLite file | Standard tables | |
| Separate checkpoints.db file | Isolated file | |

**User's choice:** Dedicated checkpoints table inside SQLite database

| Option | Description | Selected |
|--------|-------------|----------|
| thread_id = f'project:{project_id}:transcript:{transcript_id}' | Isolated state threads per run | ✓ |
| project_id only | Reused across all runs | |
| Random UUID run ID | New thread every time | |

**User's choice:** thread_id = f'project:{project_id}:transcript:{transcript_id}'

| Option | Description | Selected |
|--------|-------------|----------|
| Extended 6-node graph | 4 extraction nodes + synthesize_brief + critique_brief -> END | ✓ |
| Two separate graphs | Extraction graph & synthesis graph | |
| Independent service functions | Graph stops at questions | |

**User's choice:** Extended 6-node graph

| Option | Description | Selected |
|--------|-------------|----------|
| Hermetic integration test | Simulate process restart and test state resumption | ✓ |
| Mock unit tests only | Dictionary checks | |
| Live Groq test with manual kill | Manual testing | |

**User's choice:** Hermetic integration test

---

## Agent's Discretion

- Specific prompt phrasing and instruction tuning for 11-section brief generation and critique evaluation.
- Quality score weighting algorithm across critical, warning, and info issues.

## Deferred Ideas

- None.
