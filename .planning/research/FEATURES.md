# Feature Research

**Domain:** AI Discovery Call Analysis & Project Brief Synthesis
**Researched:** 2026-09-09
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Project Management | Organizes transcripts and briefs by client and project name | LOW | CRUD for projects in SQLite |
| Transcript Ingestion | Ingest text from discovery calls via paste or .txt/.md upload | LOW | Clean text normalization, timestamp/speaker parsing |
| Verbatim Fact Extraction | Direct client statements extracted and tagged with exact quotes | MEDIUM | Grounded extraction node returning quote span + text |
| Inference Separation | AI interpretations clearly tagged as assumptions, not facts | MEDIUM | Epistemic separation in state schema |
| Missing Information & Gaps | Highlights unanswered questions needed to scope a project | MEDIUM | Compares extracted facts against brief specification schema |
| Contradiction Detection | Identifies conflicting statements made across the call | MEDIUM | Semantic comparison of claims in transcript |
| Structured Project Brief | Generates standard 11-section project brief | MEDIUM | Synthesizes confirmed facts into actionable scope |
| Human Review & Approval | User edits, modifies, and gives final sign-off | LOW | Interrupt checkpoints before persistence |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Verbatim Quote Highlighting | Click any extracted fact to jump to and highlight its exact origin in the transcript | MEDIUM | Powers trust and rapid fact-checking |
| Epistemic Integrity Badge | Visual confidence/grounding rating distinguishing pure facts from inferred ideas | LOW | Builds user confidence vs generic black-box summaries |
| Prioritized Follow-up Questions | Generates targeted, ranked questions for the next client call | LOW | Turns gaps directly into immediate meeting prep |
| Brief Self-Critique Agent | Pre-flight audit node that flags unsupported claims or hallucinated scope before user review | MEDIUM | Quality gate in LangGraph pipeline |
| Correction Logging for Evals | Logs every user modification to build a gold-standard dataset for prompt/model fine-tuning | LOW | Closes feedback loop (Story 14) |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full Audio Recording & Transcription in App | "All-in-one convenience" | Heavy dependencies, massive compute/audio model bloat, high latency, microphone permissions friction | Accept pre-transcribed text (.txt, .md, .vtt) from Zoom/Meet/Otter |
| Autonomous Auto-Sending to Clients | "Saves one more click" | Hallucinations or misinterpretations can destroy client trust; briefs must have human sign-off | Enforce mandatory Human-in-the-Loop review and approval gate |
| Multi-tenant team roles & permissions | "Enterprise readiness" | Overcomplicates early database architecture and authentication flows | Single-operator local/workspace model for MVP |
| Arbitrary unstructured chat with transcript | "Conversational exploration" | Leads to wandering, ungrounded conversations rather than producing the concrete brief deliverable | Guided step-by-step pipeline focused on generating the 11-section brief |

## Feature Dependencies

```
[Project Creation]
    └──requires──> [Transcript Ingestion]
                       └──requires──> [Knowledge Extraction]
                                          ├──requires──> [Contradiction Detection]
                                          ├──requires──> [Gap & Question Generation]
                                          └──flows_to──> [Human Clarification Review]
                                                             └──requires──> [Brief Synthesis]
                                                                                └──requires──> [Brief Critique]
                                                                                                   └──requires──> [Human Edit & Approval]
                                                                                                                      └──flows_to──> [Correction Logging]
```

### Dependency Notes

- **Knowledge Extraction requires Transcript Ingestion:** Text must be loaded and chunked before nodes can run.
- **Brief Synthesis requires Human Clarification Review:** User has opportunity to resolve contradictions and answer unknowns before brief generation.
- **Human Edit & Approval requires Brief Critique:** The critique helps the reviewer catch subtle assumptions before finalizing.
- **Correction Logging requires Human Edit & Approval:** Diff between generated brief/state and user-approved state forms the eval sample.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Project Management**: Create, list, view, and delete client projects.
- [ ] **Transcript Ingestion**: Paste or upload text transcript into project.
- [ ] **Epistemic Extraction**: Extract Confirmed Facts (with quotes), Inferred Points, Unknowns, and Contradictions.
- [ ] **Follow-up Question Generator**: Top 3-5 prioritized follow-up questions for the client.
- [ ] **Interactive Clarification**: Review extracted knowledge, add manual answers to unknowns.
- [ ] **11-Section Brief Generator**: Structured project brief synthesis.
- [ ] **Brief Self-Critique**: Automated check for unsupported claims.
- [ ] **Human Editor & Approval**: Markdown/rich editor to finalize brief.
- [ ] **Correction Dataset Logging**: Save diffs between draft and approved briefs for eval benchmarking.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Export to PDF / Notion / Markdown**: Download or copy formatted deliverables.
- [ ] **Speaker Diarization Tagging**: Filter facts by client vs interviewer speech turns.
- [ ] **Multiple Calls per Project**: Aggregate discovery notes across call 1, call 2, and follow-ups.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Direct Zoom / Google Meet Bot Integration**: Auto-import call transcripts.
- [ ] **Custom Brief Templates**: Define custom schemas for agency-specific brief formats.
- [ ] **Team Collaboration**: Real-time collaborative editing on the brief.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Transcript Ingestion & Normalization | HIGH | LOW | P1 |
| Fact Extraction with Verbatim Quote Anchors | HIGH | MEDIUM | P1 |
| Inferred vs Confirmed Classification | HIGH | LOW | P1 |
| Unknowns & Follow-up Questions | HIGH | LOW | P1 |
| Contradiction Detection | HIGH | MEDIUM | P1 |
| Brief Synthesis (11 Sections) | HIGH | MEDIUM | P1 |
| Human Clarification & Approval Gate | HIGH | MEDIUM | P1 |
| Correction Logging (Story 14) | MEDIUM | LOW | P1 |
| Transcript Click-to-Highlight in UI | HIGH | MEDIUM | P2 |
| PDF/DOCX Export | MEDIUM | LOW | P2 |

## Sources

- `docs/product_requirements.md`
- Competitive analysis of Otter.ai, Read.ai, and agency client onboarding workflows
- Industry standard discovery call frameworks

---
*Feature research for: NexBrief*
*Researched: 2026-09-09*
