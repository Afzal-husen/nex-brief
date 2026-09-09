import os
import pytest
from app.core.config import settings
from app.services.extraction import run_extraction_pipeline

GROQ_KEY = os.getenv("GROQ_API_KEY", "")

pytestmark = pytest.mark.skipif(
    not GROQ_KEY or GROQ_KEY == "gsk_dummy_key_for_testing",
    reason="GROQ_API_KEY is not configured",
)

LIVE_SAMPLE_TRANSCRIPT = (
    "Alex: Thanks for meeting with us. Can you tell us about your goals for the portal?\n"
    "Jordan: Yes, absolutely. We need an internal dashboard built using Next.js 16 and Python FastAPI.\n"
    "Alex: What is the primary data source?\n"
    "Jordan: All records will be stored in SQLite for our initial prototype.\n"
    "Alex: What is your deployment timeline?\n"
    "Jordan: We must go live by December 1st 2026."
)


def test_live_extraction_pipeline():
    """Live integration test against Groq API when GROQ_API_KEY is present."""
    result = run_extraction_pipeline(
        transcript_id="live-test-transcript-001",
        transcript_text=LIVE_SAMPLE_TRANSCRIPT,
        project_id="live-test-project-001",
    )

    assert len(result.confirmed_facts) > 0
    # Verify truth grounding: every extracted quote MUST be a literal substring of the transcript
    for fact in result.confirmed_facts:
        assert fact.source_quote in LIVE_SAMPLE_TRANSCRIPT
        assert len(fact.spans) > 0
        for span in fact.spans:
            extracted = LIVE_SAMPLE_TRANSCRIPT[span.start_char:span.end_char]
            assert extracted.lower() == fact.source_quote.lower()
