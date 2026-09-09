from unittest.mock import MagicMock
from app.models.extraction import (
    FactCategory,
    RawFactCandidate,
)
from app.services.grounding import (
    calculate_line_numbers,
    find_quote_spans,
    verify_candidate_facts,
)

SAMPLE_TRANSCRIPT = (
    "Sarah: Hi John, thanks for joining today.\n"
    "John: Glad to be here. We need a modern web application built with Next.js 16.\n"
    "Sarah: That sounds great. What is the target timeline?\n"
    "John: We must launch by November 15th at the absolute latest.\n"
    "Sarah: Understood. Any specific database in mind?\n"
    "John: We want SQLite for the MVP. Also, remember that we must launch by November 15th."
)


def test_calculate_line_numbers():
    text = "Line 1\nLine 2\nLine 3\nLine 4"
    # 'Line 2' starts at 7, ends at 13
    ls, le = calculate_line_numbers(text, 7, 13)
    assert ls == 2
    assert le == 2


def test_find_quote_spans_exact():
    quote = "We need a modern web application built with Next.js 16."
    spans = find_quote_spans(SAMPLE_TRANSCRIPT, quote)
    assert len(spans) == 1
    assert spans[0].line_start == 2
    assert spans[0].line_end == 2
    assert SAMPLE_TRANSCRIPT[spans[0].start_char:spans[0].end_char] == quote


def test_find_quote_spans_case_insensitive():
    quote = "we need a modern web application built with next.js 16."
    spans = find_quote_spans(SAMPLE_TRANSCRIPT, quote)
    assert len(spans) == 1
    # Matches original transcript text casing
    matched_text = SAMPLE_TRANSCRIPT[spans[0].start_char:spans[0].end_char]
    assert matched_text == "We need a modern web application built with Next.js 16."


def test_find_quote_spans_whitespace_collapsed():
    multiline_transcript = "We want a\nfast,   reliable\nsystem."
    quote = "We want a fast, reliable system."
    spans = find_quote_spans(multiline_transcript, quote)
    assert len(spans) == 1
    assert multiline_transcript[spans[0].start_char:spans[0].end_char] == multiline_transcript


def test_find_quote_spans_forbids_ellipsis():
    quote_with_ellipsis = "We need a modern web application... built with Next.js 16."
    spans = find_quote_spans(SAMPLE_TRANSCRIPT, quote_with_ellipsis)
    assert spans == []

    quote_with_unicode_ellipsis = "We need a modern web application… built with Next.js 16."
    spans = find_quote_spans(SAMPLE_TRANSCRIPT, quote_with_unicode_ellipsis)
    assert spans == []


def test_find_quote_spans_multiple_occurrences():
    quote = "we must launch by November 15th"
    spans = find_quote_spans(SAMPLE_TRANSCRIPT, quote)
    assert len(spans) == 2
    assert spans[0].line_start == 4
    assert spans[1].line_start == 6


def test_find_quote_spans_speaker_prefix_stripping():
    # If LLM included speaker label
    quote = "John: We want SQLite for the MVP."
    spans = find_quote_spans(SAMPLE_TRANSCRIPT, quote)
    assert len(spans) == 1
    assert SAMPLE_TRANSCRIPT[spans[0].start_char:spans[0].end_char] == "We want SQLite for the MVP."


def test_verify_candidate_facts_deduplication():
    candidates = [
        RawFactCandidate(
            statement="Launch deadline is Nov 15",
            source_quote="we must launch by November 15th",
            category=FactCategory.TIMELINE,
        ),
        RawFactCandidate(
            statement="Target date confirmed Nov 15",
            source_quote="We must launch by November 15th",
            category=FactCategory.TIMELINE,
        ),
    ]
    confirmed, unverified = verify_candidate_facts(SAMPLE_TRANSCRIPT, candidates)
    # Deduplicated into 1 fact with 2 occurrence spans
    assert len(confirmed) == 1
    assert len(unverified) == 0
    assert len(confirmed[0].spans) == 2


def test_verify_candidate_facts_unverified_retained():
    candidates = [
        RawFactCandidate(
            statement="Client uses AWS ECS for deployment",
            source_quote="We deploy on AWS ECS clusters with Fargate",
            category=FactCategory.TECH_STACK,
        )
    ]
    confirmed, unverified = verify_candidate_facts(SAMPLE_TRANSCRIPT, candidates, llm_client=None)
    assert len(confirmed) == 0
    assert len(unverified) == 1
    assert unverified[0].statement == "Client uses AWS ECS for deployment"
    assert "Quote not found" in unverified[0].reason


def test_verify_candidate_facts_with_mock_retry_success():
    mock_llm = MagicMock()
    # Corrects the quote on retry
    mock_llm.invoke.return_value = MagicMock(content="We want SQLite for the MVP.")

    candidates = [
        RawFactCandidate(
            statement="Client needs SQLite",
            source_quote="They are requesting SQLite database",  # hallucinated quote
            category=FactCategory.TECH_STACK,
        )
    ]
    confirmed, unverified = verify_candidate_facts(SAMPLE_TRANSCRIPT, candidates, llm_client=mock_llm)
    assert len(confirmed) == 1
    assert confirmed[0].source_quote == "We want SQLite for the MVP."
    assert len(unverified) == 0
    mock_llm.invoke.assert_called_once()
