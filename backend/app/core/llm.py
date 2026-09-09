from typing import Any, Callable
from langchain_groq import ChatGroq
from backend.app.core.config import settings
from backend.app.models.extraction import RawExtractionPayload


# Global mock override for testing
_mock_extraction_client: Any = None


def set_mock_extraction_client(client: Any) -> None:
    """Set a mock client for structured extraction (used in hermetic tests)."""
    global _mock_extraction_client
    _mock_extraction_client = client


def clear_mock_extraction_client() -> None:
    """Clear the mock extraction client."""
    global _mock_extraction_client
    _mock_extraction_client = None


def get_groq_llm(
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.0,
    timeout: int = 30,
    max_retries: int = 3,
) -> ChatGroq:
    """Initialize a ChatGroq client with the specified configuration."""
    api_key = settings.groq_api_key or "gsk_dummy_key_for_testing"
    return ChatGroq(
        model_name=model,
        groq_api_key=api_key,
        temperature=temperature,
        request_timeout=timeout,
        max_retries=max_retries,
    )


def get_extraction_llm_with_fallback(
    primary_model: str = "llama-3.3-70b-versatile",
    fallback_model: str = "llama-3.1-8b-instant",
    temperature: float = 0.0,
    timeout: int = 30,
) -> Any:
    """
    Returns primary 70b model with automatic fallback to 8b on rate limits or transient errors (D-01).
    """
    primary = get_groq_llm(
        model=primary_model,
        temperature=temperature,
        timeout=timeout,
    )
    fallback = get_groq_llm(
        model=fallback_model,
        temperature=temperature,
        timeout=timeout,
    )
    return primary.with_fallbacks([fallback])


def get_structured_extraction_client() -> Any:
    """
    Returns an extraction client with structured output binding for RawExtractionPayload (D-24).
    If a mock client is configured, returns the mock client instead.
    """
    if _mock_extraction_client is not None:
        return _mock_extraction_client

    llm = get_extraction_llm_with_fallback()
    return llm.with_structured_output(RawExtractionPayload)
