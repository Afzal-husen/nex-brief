# Phase 8: Transcript Ingestion & Fact Grounding UI - Research

**Researched:** 2026-09-09
**Domain:** Next.js 16 / React 19 Client UI, File Ingestion, Text Processing, Bidirectional Quote Highlighting, FastAPI Integration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Resizable dual pane with drag handle on desktop (transcript reader on left, epistemic fact cards on right).
- **D-02:** Responsive tabbed toggle on mobile/tablet viewports (`Transcript` tab vs `Facts` tab) with persistent active-fact indicator badge.
- **D-03:** Sticky workspace sub-header with breadcrumbs, project title, live status badge, and an actionable `Analyze / Run Extraction` action button.
- **D-04:** Initial state: full-width focused ingestion card before transcript upload, smoothly transitioning to the dual-pane workspace once submitted.
- **D-05:** Dual input tabs in ingestion: `Paste Text` (auto-growing textarea) and `Upload File` (drag-and-drop zone for `.txt`, `.md`, `.vtt`, `.srt`).
- **D-06:** Live metrics inspection bar showing character count, estimated word count, and detected speaker cues (e.g., "3 speakers detected: Client, Alex, Sarah").
- **D-07:** Single active transcript per project for v1 with an explicit `Replace / Re-upload` action.
- **D-08:** Direct inline `Start Analysis` CTA button once transcript is saved, showing a subtle loading spinner and immediately triggering `POST /api/v1/projects/{id}/analyze`.
- **D-09:** Soft glowing badge highlight visual treatment: `bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400` with subtle 1.5s pulse animation.
- **D-10:** Smooth scrolling (`behavior: 'smooth'`) that vertically centers target quote within transcript pane when a fact card is clicked, accompanied by anchor flash ring.
- **D-11:** Bidirectional grounding: clicking an anchored quote span in the transcript reader scrolls to and selects its corresponding fact card in the right pane.
- **D-12:** Normalized whitespace quote matching: collapses multi-space and newline variations between LLM quote citations and raw transcript text to prevent broken highlights.
- **D-13:** Segmented filter pills at top of right pane: `All`, `Confirmed Facts`, `Inferred Points`, `Contradictions`, `Unknown Gaps`, with live count badges and a search input.
- **D-14:** Rich epistemic card design: bold statement, speaker pill, category tag, verbatim quote preview block with click-to-locate action, and reasoning note for inferred points.
- **D-15:** Dedicated FastAPI backend endpoint `GET /api/v1/projects/{id}/analysis` to query and return latest checkpointed extraction state, paired with SWR caching on frontend.
- **D-16:** Sticky action footer at bottom of fact pane: "Proceed to Clarifications (X items to resolve) ->" guiding into Phase 9.

### the agent's Discretion
- Workspace component subfolder structure in `frontend/src/components/workspace/`.
- Drag handle resize physics with percentage clamping (30% to 70%).
- Quote token indexing and matching helper functions in `frontend/src/lib/utils/quote-highlighter.ts`.

### Deferred Ideas (OUT OF SCOPE)
- Interactive Clarification Dialogs (`UI-04`): Deferred to Phase 9.
- Brief Markdown Editor & Approval (`UI-05`): Deferred to Phase 10.
- Audio/video speech-to-text upload (`EXT-03`): Deferred to post-MVP.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Transcript File Parsing (.txt, .md, .vtt, .srt) | Browser/Client | — | Client-side `FileReader` extracts text instantly with zero server roundtrip before submission |
| Speaker Cue Detection | Browser/Client | — | Fast regex analysis gives instant live feedback as user types or drops files |
| Transcript Storage & Normalization | API/Backend | Database/Storage | `POST /projects/{id}/transcripts` persists transcript to SQLite and normalizes text |
| Extraction Pipeline Execution | API/Backend | LLM Provider (Groq) | `POST /projects/{id}/analyze` runs LangGraph extraction state machine |
| Checkpointed Extraction State Retrieval | API/Backend | Database/Storage | `GET /projects/{id}/analysis` reads intermediate state from SqliteSaver checkpointer |
| Dual-Pane Resizing & Tab Navigation | Browser/Client | — | High-performance CSS flexbox / mouse drag events without layout thrashing |
| Quote Token Matching & Highlighting | Browser/Client | — | Pure function runs over transcript string to slice into highlighted & regular text spans |
| Bidirectional Scroll & Focus Orchestration | Browser/Client | — | DOM `scrollIntoView` and React active state management |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 8 bridges the backend extraction intelligence (Phases 1-6) and frontend dashboard (Phase 7) into a tangible, grounded user experience. The core challenge is making client statements visibly and interactively anchor every AI deduction: clicking a fact card immediately locates its verbatim quote in the transcript, while clicking an anchored quote highlights the corresponding fact.

The technical architecture involves three key modules:
1. **Backend Endpoint**: Add `GET /api/v1/projects/{id}/analysis` in FastAPI (`workflow.py`). It accesses the LangGraph checkpointer for the project's latest transcript thread and returns `AnalyzeResponse` (`confirmed_facts`, `inferred_points`, `contradictions`, `unknown_gaps`, `clarification_questions`), allowing frontend SWR to revalidate state seamlessly across page reloads.
2. **Transcript Ingestion & Preview**: An interactive component supporting tabbed text paste and file drag-and-drop (`.txt`, `.md`, `.vtt`, `.srt`), with client-side text extraction and real-time regex metrics (character count, estimated word count, detected speakers).
3. **Dual-Pane Grounding Workspace**: A resizable desktop split pane (`SplitView`) and responsive mobile tab switcher. The left pane renders the transcript with syntax-like span highlights; the right pane renders categorized, filterable epistemic cards with search. A normalized whitespace substring matcher connects the two bidirectionally with smooth scrolling.

**Primary recommendation:** Build pure utility functions for whitespace normalization and quote segment parsing, create modular workspace components in `frontend/src/components/workspace/`, and expose `GET /api/v1/projects/{id}/analysis` on FastAPI to ensure instantaneous restoration of extraction state on reload.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.3.4 | Application framework | Server/client component isolation, fast routing |
| React | 19.2.8 | UI Component library | Concurrent rendering, stable hooks (`useRef`, `useCallback`, `useMemo`) |
| SWR | 2.3.x | Client-side data fetching | Stale-while-revalidate, deduplication, automatic error retry |
| Tailwind CSS | 4.x | Styling engine | High performance utility classes with `@import "tailwindcss";` |
| Lucide React | 1.16.x | SVG Icons | Crisp developer tool aesthetics |
| FastAPI | 0.115.x | Backend REST API | High-speed ASGI routing and Pydantic validation |
| SQLModel | 0.0.22 | Persistence | ORM mapped to SQLite database |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native DOM `FileReader` | Web API | Local file parsing | Reading dropped `.txt`, `.md`, `.vtt`, `.srt` files in browser |
| Native `element.scrollIntoView` | Web API | Smooth scrolling | Centering target quote elements without external smooth-scroll libraries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native drag resize | `react-resizable-panels` | External library adds React 19 peer-dependency risks; simple 40-line `onMouseMove` handler in React is robust, lightweight, and zero-dep |
| Native text regex split | `prismjs` / rich text editor | Read-only transcript viewing with span wrapping is faster and avoids editor state overhead |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### System Architecture Diagram

```
[User Input: Paste / Drag File]
               │
               ▼
[IngestionDropzone / Live Metrics Bar]
               │
               │ Submits transcript
               ▼
[POST /projects/{id}/transcripts] ────► [SQLite Transcripts Table]
               │
               │ Auto-triggers or user clicks 'Start Analysis'
               ▼
[POST /projects/{id}/analyze] ────────► [LangGraph State Machine]
                                                │
                                                ▼ Checkpoints at 'synthesize_brief'
                                       [SqliteSaver Checkpointer]
                                                ▲
                                                │
[GET /projects/{id}/analysis] ──────────────────┘
               │
               │ SWR cache
               ▼
[Workspace (projects/[id]/page.tsx)]
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[TranscriptPane]    [FactCardsPane]
(Left Pane:         (Right Pane:
 Quote Highlighting  Segmented Filter Tabs
 & Auto-Scroll)      Search & Rich Fact Cards)
   ▲                       │
   │  Quote Click / Scroll │
   └───────────────────────┘
```

### Recommended Project Structure
```
frontend/src/
├── app/
│   └── projects/
│       └── [id]/
│           └── page.tsx              # Primary project workspace orchestration
├── components/
│   ├── workspace/
│   │   ├── IngestionHero.tsx         # Focused upload/paste hero for new transcripts
│   │   ├── ResizableSplitView.tsx    # Split pane container with drag handle & mobile tabs
│   │   ├── TranscriptPane.tsx        # Scrollable transcript reader with quote highlights
│   │   ├── FactCardsPane.tsx         # Filter pills, search bar, and epistemic card list
│   │   ├── EpistemicCard.tsx         # Individual rich card (Confirmed, Inferred, etc.)
│   │   └── ClarificationFooter.tsx   # Sticky progression footer into Phase 9
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Extended with transcripts and analysis APIs
│   │   ├── hooks.ts                  # Extended with useTranscripts, useAnalysis
│   │   └── types.ts                  # Extraction and analysis interfaces
│   └── utils/
│       ├── quote-matcher.ts          # Whitespace-tolerant quote matching & span slicing
│       └── transcript-parser.ts      # VTT/SRT cue stripper and speaker regex detector
```

### Pattern 1: Normalized Whitespace Quote Slicing
**What:** LLM quote extractions occasionally collapse multiple whitespace characters or normalize newlines, which can break naive `text.indexOf(quote)`.
**Solution:** Normalize both the transcript text and quote string (replace `\s+` with a single space) to locate the character offset, then map back to the original text positions for non-destructive DOM rendering.

```typescript
export interface TextSpan {
  text: string;
  isQuote: boolean;
  factId?: string;
}

export function buildTranscriptSpans(
  rawText: string,
  quotes: Array<{ id: string; quote: string }>
): TextSpan[] {
  // Slices raw text into alternating non-quote and quote segments with quote IDs
}
```

### Pattern 2: Smooth Scrolling with Centering and Pulse
**What:** When a user selects a fact card, the transcript pane scrolls smoothly so the target quote sits directly in the vertical center with a transient highlight ring.
```typescript
const quoteRef = document.getElementById(`quote-${factId}`);
if (quoteRef) {
  quoteRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
  quoteRef.classList.add('quote-highlight-pulse');
  setTimeout(() => {
    quoteRef.classList.remove('quote-highlight-pulse');
  }, 1500);
}
```

### Anti-Patterns to Avoid
- **Mutating raw transcript text with HTML string replacement (`innerHTML`):** Dangerous (XSS risk) and breaks React DOM reconciler. Use structured React array of span elements instead.
- **Polling during idle states:** Once status is `awaiting_clarification`, disable aggressive SWR polling (`revalidateOnFocus: false`) since analysis is already frozen at the breakpoint.
- **Forcing layout re-renders on every mouse pixel during drag:** Use CSS `calc` or CSS variable on the parent container updated via `requestAnimationFrame` for buttery 60fps drag resizing.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File parsing | Complex WebAssembly file readers | Native browser `FileReader.readAsText()` | Plain text, markdown, VTT, and SRT are UTF-8 text files read natively in <10ms |
| Data caching & revalidation | Custom Redux/Context polling engine | `SWR` with existing `frontend/src/lib/api/` setup | Handles request deduplication, cache invalidation, and retry cleanly |
| Toast feedback | Ad-hoc notification timers | Existing `Toast.tsx` / `ToastProvider` | Already tested and integrated from Phase 7 |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Quote Not Found Due to Linebreak or Whitespace Differences
**What goes wrong:** Fact card shows quote `"We need SSO for 500 employees"`, but clicking it fails to highlight anything because transcript had `We need\nSSO for  500 employees`.
**How to avoid:** Normalize internal spaces and newlines (`.replace(/\s+/g, ' ')`) during search comparison.

### Pitfall 2: Memory Leak or Window Freeze on Drag Resize
**What goes wrong:** Adding `mousemove` listener on mouse down but failing to unbind on `mouseup` outside the browser window.
**How to avoid:** Attach listener to `window` on `mousedown` and always remove in `cleanup` and on `window.onmouseup`.

### Pitfall 3: Analysis State Missing on Page Reload
**What goes wrong:** User runs analysis, sees facts, refreshes page, and facts vanish because only `POST /analyze` returned them.
**How to avoid:** Implement `GET /api/v1/projects/{id}/analysis` reading from the SqliteSaver checkpointer so state is always queryable by project ID.
</common_pitfalls>

<code_examples>
## Code Examples

### Backend `GET /api/v1/projects/{id}/analysis` Endpoint
```python
@router.get(
    "/projects/{id}/analysis",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current or checkpointed analysis results",
)
def get_project_analysis(
    id: str,
    session: Session = Depends(get_session),
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    stmt = select(Transcript).where(Transcript.project_id == id).order_by(Transcript.created_at.desc())
    transcript = session.exec(stmt).first()
    if not transcript:
        return AnalyzeResponse(
            project_id=id,
            status=project.status,
            confirmed_facts=[],
            inferred_points=[],
            contradictions=[],
            unknown_gaps=[],
            clarification_questions=[],
        )

    thread_id = f"project:{id}:transcript:{transcript.id}"
    config = {"configurable": {"thread_id": thread_id}}

    with get_checkpointer() as checkpointer:
        graph = build_extraction_graph(checkpointer=checkpointer)
        state_tuple = graph.get_state(config)
        state = state_tuple.values if state_tuple else {}

    return AnalyzeResponse(
        project_id=id,
        status=project.status,
        confirmed_facts=state.get("confirmed_facts", []),
        inferred_points=state.get("inferred_points", []),
        contradictions=state.get("contradictions", []),
        unknown_gaps=state.get("unknown_gaps", []),
        clarification_questions=state.get("clarification_questions", []),
    )
```
</code_examples>

<sources>
## Sources

### Primary (HIGH confidence)
- `backend/app/services/workflow.py`: `trigger_project_analysis` checkpointer thread ID format `project:{project_id}:transcript:{transcript.id}`
- `backend/app/api/transcripts.py`: Transcript ingestion models and endpoints
- `frontend/src/lib/api/client.ts`: SWR client implementation
- `08-CONTEXT.md`: Locked decisions D-01 through D-16
- `08-UI-SPEC.md`: UI design contract specifications

### Secondary (MEDIUM confidence)
- React 19 event listener lifecycle best practices
- W3C WebVTT / SubRip text subtitle structure
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js 16, React 19, Tailwind CSS v4, FastAPI, LangGraph SqliteSaver checkpointer
- Ecosystem: SWR, Lucide React
- Patterns: Dual-pane resize, Bidirectional quote highlight anchoring, Speaker cue detection

**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: HIGH
- Code examples: HIGH

**Research date:** 2026-09-09
**Valid until:** 2026-10-09
</metadata>

---

*Phase: 08-transcript-ingestion-fact-grounding-ui*
*Research completed: 2026-09-09*
*Ready for planning: yes*
