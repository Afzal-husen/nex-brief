import re
from typing import Any
from app.models.extraction import (
    ConfirmedFact,
    QuoteSpan,
    RawFactCandidate,
    UnverifiedCandidate,
)


def calculate_line_numbers(text: str, start_char: int, end_char: int) -> tuple[int, int]:
    """Calculate 1-indexed (line_start, line_end) for a character span in text."""
    line_start = text.count("\n", 0, start_char) + 1
    line_end = text.count("\n", 0, end_char) + 1
    return line_start, line_end


def _strip_quote_decorations(quote: str) -> str:
    """Remove surrounding quotation marks and outer whitespace."""
    q = quote.strip()
    # Strip common enclosing quotes
    for char in ('"', "'", "“", "”", "«", "»", "`"):
        if q.startswith(char) and q.endswith(char) and len(q) >= 2:
            q = q[1:-1].strip()
    return q


def _strip_speaker_prefix(quote: str) -> str:
    """Remove speaker label prefix like 'Client: ' or 'Sarah: ' if present."""
    match = re.match(r"^[^:\n]{1,30}:\s*(.+)$", quote)
    if match:
        return match.group(1).strip()
    return quote


def find_quote_spans(transcript_text: str, quote: str) -> list[QuoteSpan]:
    """
    Search for all literal occurrences of quote in transcript_text.
    Enforces D-06, D-07, D-08, D-10, D-13, D-14:
    - Strictly forbids ellipsis ('...' or '…')
    - Exact match first
    - Case-insensitive fallback (anchors to actual transcript text casing)
    - Whitespace-collapsed fallback
    - Calculates character offsets and 1-indexed line numbers
    """
    if not quote or not transcript_text:
        return []

    # D-10: Strictly forbid ellipsis
    if "..." in quote or "…" in quote:
        return []

    clean_quote = _strip_quote_decorations(quote)
    # D-09: Exclude speaker label from quote text
    clean_quote = _strip_speaker_prefix(clean_quote)
    if not clean_quote:
        return []

    spans: list[QuoteSpan] = []
    seen_ranges: set[tuple[int, int]] = set()

    def _collect_spans(pattern_str: str, flags: int = 0) -> None:
        try:
            pattern = re.compile(pattern_str, flags)
            for m in pattern.finditer(transcript_text):
                rng = (m.start(), m.end())
                if rng not in seen_ranges:
                    seen_ranges.add(rng)
                    ls, le = calculate_line_numbers(transcript_text, m.start(), m.end())
                    spans.append(QuoteSpan(
                        start_char=m.start(),
                        end_char=m.end(),
                        line_start=ls,
                        line_end=le,
                    ))
        except re.error:
            pass

    escaped = re.escape(clean_quote)
    # Collect exact matches first
    _collect_spans(escaped)
    # Also collect case-insensitive matches to find all occurrences across transcript (D-08, D-13)
    _collect_spans(escaped, flags=re.IGNORECASE)

    if spans:
        spans.sort(key=lambda s: s.start_char)
        return spans

    # Try 3: Whitespace-tolerant match (D-06)
    ws_pattern = r"\s+".join(re.escape(part) for part in clean_quote.split() if part)
    if ws_pattern:
        _collect_spans(ws_pattern)
        _collect_spans(ws_pattern, flags=re.IGNORECASE)

    spans.sort(key=lambda s: s.start_char)
    return spans


def re_prompt_failed_quote(
    claim: str,
    failed_quote: str,
    transcript_text: str,
    llm_client: Any,
) -> tuple[str | None, list[QuoteSpan]]:
    """
    Trigger a single targeted re-prompt for a candidate fact whose quote failed verification (D-05).
    Returns (corrected_quote, spans) or (None, []).
    """
    if not llm_client:
        return None, []

    prompt = (
        f"You previously extracted this client statement:\n"
        f"Claim: {claim}\n"
        f"Quote provided: \"{failed_quote}\"\n\n"
        f"However, the quote could not be found verbatim in the transcript.\n"
        f"Transcript text snippet:\n{transcript_text[:4000]}\n\n"
        f"Instructions:\n"
        f"1. If the client explicitly stated this, reply with ONLY the exact, contiguous verbatim substring from the transcript.\n"
        f"2. Do NOT use ellipsis (...) or omit words.\n"
        f"3. If the transcript does not contain this exact statement, reply with 'UNSUPPORTED'."
    )

    try:
        response = llm_client.invoke(prompt)
        content = getattr(response, "content", str(response)).strip()
        if not content or "UNSUPPORTED" in content.upper():
            return None, []
        
        # Check if the corrected quote matches
        corrected_quote = _strip_quote_decorations(content)
        spans = find_quote_spans(transcript_text, corrected_quote)
        if spans:
            return corrected_quote, spans
    except Exception:
        pass

    return None, []


def verify_candidate_facts(
    transcript_text: str,
    candidates: list[RawFactCandidate],
    llm_client: Any = None,
) -> tuple[list[ConfirmedFact], list[UnverifiedCandidate]]:
    """
    Programmatically verify all candidate facts against the transcript text.
    Implements verbatim substring verification, targeted retry for failures, and deduplication (D-05..D-15).
    """
    confirmed: list[ConfirmedFact] = []
    unverified: list[UnverifiedCandidate] = []
    quote_to_fact: dict[str, ConfirmedFact] = {}

    for cand in candidates:
        spans = find_quote_spans(transcript_text, cand.source_quote)
        effective_quote = cand.source_quote

        # If not found, attempt single targeted re-prompt (D-05)
        if not spans and llm_client is not None:
            corrected_quote, retry_spans = re_prompt_failed_quote(
                claim=cand.statement,
                failed_quote=cand.source_quote,
                transcript_text=transcript_text,
                llm_client=llm_client,
            )
            if retry_spans and corrected_quote:
                effective_quote = corrected_quote
                spans = retry_spans

        if spans:
            # Check for deduplication by quote (D-12)
            norm_key = effective_quote.strip().lower()
            if norm_key in quote_to_fact:
                existing_fact = quote_to_fact[norm_key]
                # Merge spans
                existing_ranges = {(s.start_char, s.end_char) for s in existing_fact.spans}
                for s in spans:
                    if (s.start_char, s.end_char) not in existing_ranges:
                        existing_fact.spans.append(s)
            else:
                fact = ConfirmedFact(
                    category=cand.category,
                    statement=cand.statement,
                    source_quote=effective_quote,
                    speaker=cand.speaker,
                    spans=spans,
                )
                quote_to_fact[norm_key] = fact
                confirmed.append(fact)
        else:
            unverified.append(
                UnverifiedCandidate(
                    statement=cand.statement,
                    failed_quote=cand.source_quote,
                    speaker=cand.speaker,
                    reason="Quote not found in transcript text after verification",
                )
            )

    return confirmed, unverified
