from unittest.mock import MagicMock
from app.core.llm import (
    get_groq_llm,
    get_extraction_llm_with_fallback,
    get_structured_extraction_client,
    set_mock_extraction_client,
    clear_mock_extraction_client,
)
from app.models.extraction import (
    RawExtractionPayload,
    RawFactCandidate,
    FactCategory,
)


def test_get_groq_llm_parameters():
    llm = get_groq_llm(model="llama-3.3-70b-versatile", temperature=0.0, timeout=45)
    assert llm.model_name == "llama-3.3-70b-versatile"
    # ChatGroq clamps temperature 0.0 to 1e-8 internally
    assert llm.temperature <= 1e-6
    assert llm.request_timeout == 45


def test_get_extraction_llm_with_fallback():
    runnable = get_extraction_llm_with_fallback()
    # RunnableWithFallbacks wraps primary with fallbacks
    assert hasattr(runnable, "fallbacks")
    assert len(runnable.fallbacks) == 1
    assert runnable.fallbacks[0].model_name == "llama-3.1-8b-instant"


def test_mock_extraction_client_override():
    mock_client = MagicMock()
    mock_payload = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Project deadline is end of year",
                source_quote="We must finish by end of year",
                speaker="Client",
                category=FactCategory.TIMELINE,
            )
        ]
    )
    mock_client.invoke.return_value = mock_payload

    set_mock_extraction_client(mock_client)
    try:
        client = get_structured_extraction_client()
        result = client.invoke("Sample transcript prompt")
        assert result.facts[0].statement == "Project deadline is end of year"
        mock_client.invoke.assert_called_once_with("Sample transcript prompt")
    finally:
        clear_mock_extraction_client()
