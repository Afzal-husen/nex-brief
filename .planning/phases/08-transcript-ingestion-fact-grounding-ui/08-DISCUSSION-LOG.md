# Phase 8: Transcript Ingestion & Fact Grounding UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 8-transcript-ingestion-fact-grounding-ui
**Areas discussed:** Workspace Layout & Split View, Transcript Ingestion UX, Quote Highlighting & Auto-Scroll, Epistemic Card Filtering & Grouping

---

## Workspace Layout & Split View

### Question 1: Desktop Split View Proportion
| Option | Description | Selected |
|--------|-------------|----------|
| Asymmetric split | Approx. 45% transcript reader on left, 55% epistemic cards on right | |
| Balanced 50/50 split | Equal pane widths between raw evidence and extracted epistemic insights | |
| Resizable dual pane with drag handle | Lets users customize pane widths according to transcript length or screen resolution | ✓ |

**User's choice:** Resizable dual pane with drag handle
**Notes:** Custom drag handle provides flexibility across diverse transcript lengths and screen sizes.

### Question 2: Mobile / Tablet Responsiveness
| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed toggle | Tabbed toggle on mobile/tablet (Transcript tab \| Facts tab) with persistent active-fact indicator badge | ✓ |
| Vertical stack | Transcript reader on top, Fact cards below with scroll-to jump actions | |
| You decide | Agent discretion | |

**User's choice:** Tabbed toggle on mobile/tablet (Transcript tab | Facts tab) with persistent active-fact indicator badge
**Notes:** Prevents excessive scrolling on small viewports while preserving context of which fact is currently inspected.

### Question 3: Navigation & Control Elements
| Option | Description | Selected |
|--------|-------------|----------|
| Sticky workspace sub-header | Sticky sub-header with breadcrumb, project status badge, and 'Analyze / Run Extraction' action button | ✓ |
| Full pipeline stage stepper bar | Ingestion -> Clarification -> Brief Synthesis -> Approval | |
| Minimalist header | Back button and trigger action only | |

**User's choice:** Sticky workspace sub-header with breadcrumb, project status badge, and an 'Analyze / Run Extraction' action button
**Notes:** Keeps primary action accessible while users scroll through long transcripts.

### Question 4: Initial View Before Transcript Submission
| Option | Description | Selected |
|--------|-------------|----------|
| Full-width focused ingestion card | Once submitted, smoothly transitions into the dual-pane workspace | ✓ |
| Immediate dual pane | Left pane upload/dropzone, right pane empty placeholder | |
| You decide | Agent discretion | |

**User's choice:** Full-width focused ingestion card first — once a transcript is submitted, smoothly transition into the dual-pane workspace
**Notes:** Provides a distraction-free ingestion hero experience for new projects.

---

## Transcript Ingestion UX

### Question 1: Ingestion Input Methods
| Option | Description | Selected |
|--------|-------------|----------|
| Dual input tab | 'Paste Text' tab with large auto-growing textarea AND 'Upload File' tab with drag-and-drop zone (.txt, .md, .vtt, .srt) | ✓ |
| Unified input area | Drop zone directly over the textarea | |
| Paste-first | Discreet 'or upload file' button | |

**User's choice:** Dual input tab: 'Paste Text' tab with large auto-growing textarea AND 'Upload File' tab with drag-and-drop zone (.txt, .md, .vtt, .srt)
**Notes:** Clear separation between pasting clipboard text and dropping file artifacts.

### Question 2: Real-time Inspection Metrics
| Option | Description | Selected |
|--------|-------------|----------|
| Live counter bar | Character count, estimated word count, and detected speaker cues | ✓ |
| Standard character and word count | Counts with max limit indicator | |
| You decide | Agent discretion | |

**User's choice:** Live counter bar showing character count, estimated word count, and detected speaker cues (e.g. '3 speakers detected: Client, Alex, Sarah')
**Notes:** Gives immediate epistemic feedback on transcript quality and multi-party structure.

### Question 3: Multiple Transcripts / Revisions
| Option | Description | Selected |
|--------|-------------|----------|
| Single active transcript | Single active transcript per project for v1 with 'Replace / Re-upload' action | ✓ |
| Multiple transcript versions | Sidebar or dropdown with versions | |
| You decide | Agent discretion | |

**User's choice:** Single active transcript per project for v1 with a 'Replace / Re-upload' action if the user wants to update the conversation
**Notes:** Simple, reliable mental model for v1 discovery call ingestion.

### Question 4: Transition to Analysis Pipeline
| Option | Description | Selected |
|--------|-------------|----------|
| Direct inline CTA | 'Start Analysis' button once transcript is saved, showing spinner and transition to processing state | ✓ |
| Separate two-step flow | Save draft first, then separate Run Analysis button | |
| You decide | Agent discretion | |

**User's choice:** Direct inline 'Start Analysis' CTA button once transcript is saved, showing a subtle spinner and transition to the processing state
**Notes:** Reduces friction and immediately moves the user into the extraction flow.

---

## Quote Highlighting & Auto-Scroll

### Question 1: Highlighting Visual Treatment
| Option | Description | Selected |
|--------|-------------|----------|
| Soft glowing badge highlight | Emerald/amber background tint `bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400` with brief 1.5s pulse animation | ✓ |
| Classic yellow highlighter | `bg-amber-300 text-zinc-950 font-medium rounded-sm` | |
| Underline with subtle pulse | `border-b-2 border-dashed border-emerald-400 bg-zinc-900/60` | |

**User's choice:** Soft glowing badge highlight (`bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400` with brief 1.5s pulse animation)
**Notes:** Aesthetic dark-mode contrast without visually obscuring surrounding dialogue.

### Question 2: Auto-Scroll Behavior
| Option | Description | Selected |
|--------|-------------|----------|
| Smooth scroll | Smooth scroll (`behavior: 'smooth'`) positioning target quote in vertical center of transcript pane, with anchor flash animation | ✓ |
| Instant jump | Instant jump directly to quote | |
| You decide | Agent discretion | |

**User's choice:** Smooth scroll (`behavior: 'smooth'`) positioning the target quote in the vertical center of the transcript pane, with an anchor flash animation
**Notes:** Smooth motion gives orientation and spatial context.

### Question 3: Bidirectional Interaction
| Option | Description | Selected |
|--------|-------------|----------|
| Bidirectional | Clicking an anchored quote in transcript scrolls to and activates its corresponding fact card on the right pane | ✓ |
| Unidirectional | Clicking fact cards highlights transcript only | |
| Hover preview | Hovering quote shows tooltip | |

**User's choice:** Bidirectional: clicking an anchored quote in the transcript scrolls to and activates its corresponding fact card on the right pane
**Notes:** Core epistemic grounding: users can explore from evidence to fact or fact to evidence.

### Question 4: Whitespace and Formatting Matching
| Option | Description | Selected |
|--------|-------------|----------|
| Normalized whitespace match | Collapse multi-space/newline variations to ensure exact match even if formatting slightly shifted | ✓ |
| Strict verbatim match only | Character-for-character exact matches only | |
| You decide | Agent discretion | |

**User's choice:** Normalized whitespace match: collapse multi-space/newline variations to ensure exact match even if formatting slightly shifted
**Notes:** Prevents brittle quote locator failures due to minor whitespace differences.

---

## Epistemic Card Filtering & Grouping

### Question 1: Categorization and Filtering
| Option | Description | Selected |
|--------|-------------|----------|
| Segmented filter pills | Segmented pills at top: `[All, Confirmed Facts, Inferred Points, Contradictions, Unknowns]` with active counts and search filter | ✓ |
| Grouped vertical collapsible sections | Accordions for each category | |
| Sidebar filter checklist | Multi-category selection | |

**User's choice:** Segmented filter pills at top of right pane: [All (18), Confirmed Facts (10), Inferred Points (4), Contradictions (2), Unknowns (2)] with active count badges and search filter
**Notes:** High information density and instant filtering across epistemic categories.

### Question 2: Card Details and Visual Structure
| Option | Description | Selected |
|--------|-------------|----------|
| Rich epistemic card | Bold statement, speaker pill, category tag, verbatim quote preview block with click-to-locate action, and reasoning note for inferences | ✓ |
| Compact cards | Single-line summary with expand drawer | |
| You decide | Agent discretion | |

**User's choice:** Rich epistemic card: bold statement, speaker pill, category tag, verbatim quote preview block (with quote click action), and reasoning note for inferred points
**Notes:** Every fact immediately presents its proof anchor (the quote) and AI reasoning.

### Question 3: State Retrieval & Persistence Across Reloads
| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated GET endpoint | Add `GET /api/v1/projects/{id}/analysis` endpoint on FastAPI backend to fetch checkpointed/latest extraction state with SWR caching | ✓ |
| Local state / SWR only | Persist in local state and fall back to project details | |
| You decide | Agent discretion | |

**User's choice:** Add a dedicated `GET /api/v1/projects/{id}/analysis` endpoint on FastAPI backend to fetch checkpointed/latest extraction state with SWR caching on the frontend
**Notes:** Robust architecture: refreshing or sharing the workspace URL restores complete epistemic facts without re-running LLM analysis.

### Question 4: Transition to Phase 9
| Option | Description | Selected |
|--------|-------------|----------|
| Floating / sticky footer | 'Proceed to Clarifications (X items to resolve) ->' that activates once analysis is reviewed | ✓ |
| Prominent top banner | Stage progression button at top | |
| You decide | Agent discretion | |

**User's choice:** Floating or bottom-sticky action footer: 'Proceed to Clarifications (4 items to resolve) ->' that activates once analysis is reviewed
**Notes:** Provides a persistent, contextual call-to-action leading into Phase 9.

---

## the agent's Discretion
- Organization of workspace subcomponents in `frontend/src/components/workspace/`.
- Drag handle resize physics and minimum/maximum pane percentage clamping (e.g. 30% to 70%).
- Quote token indexing and matching helper functions in `frontend/src/lib/utils/quote-highlighter.ts`.

## Deferred Ideas
- Phase 9 (`UI-04`): Answering unknown gap questions and resolving contradictions in an interactive review modal/drawer.
- Phase 10 (`UI-05`): 11-section project brief Markdown editor and final approval gate.
- Audio speech-to-text upload (`EXT-03`): Deferred post-MVP.
