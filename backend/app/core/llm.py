from typing import Any, Callable
from langchain_groq import ChatGroq
from backend.app.core.config import settings
from backend.app.models.extraction import (
    RawExtractionPayload,
    RawContradictionPayload,
    RawClarificationPayload,
)


# Global mock overrides for testing
_mock_extraction_client: Any = None
_mock_contradiction_client: Any = None
_mock_clarification_client: Any = None


def set_mock_extraction_client(client: Any) -> None:
    """Set a mock client for structured extraction (used in hermetic tests)."""
    global _mock_extraction_client
    _mock_extraction_client = client


def clear_mock_extraction_client() -> None:
    """Clear the mock extraction client."""
    global _mock_extraction_client
    _mock_extraction_client = None


def set_mock_contradiction_client(client: Any) -> None:
    """Set a mock client for structured contradiction detection."""
    global _mock_contradiction_client
    _mock_contradiction_client = client


def clear_mock_contradiction_client() -> None:
    """Clear the mock contradiction client."""
    global _mock_contradiction_client
    _mock_contradiction_client = None


def set_mock_clarification_client(client: Any) -> None:
    """Set a mock client for structured clarification question generation."""
    global _mock_clarification_client
    _mock_clarification_client = client


def clear_mock_clarification_client() -> None:
    """Clear the mock clarification client."""
    global _mock_clarification_client
    _mock_clarification_client = None


def get_groq_llm(
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.0,
    timeout: int = 30,
    max_retries: int = 3,
) -> ChatGroq:
    """Initialize a ChatGroq client with the specified configuration."""
    return ChatGroq(
        model=model,
        temperature=temperature,
        timeout=timeout,
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


def get_structured_contradiction_client() -> Any:
    """
    Returns a client with structured output binding for RawContradictionPayload (D-06).
    If a mock client is configured, returns the mock client instead.
    """
    if _mock_contradiction_client is not None:
        return _mock_contradiction_client

    llm = get_extraction_llm_with_fallback()
    return llm.with_structured_output(RawContradictionPayload)


def get_structured_clarification_client() -> Any:
    """
    Returns a client with structured output binding for RawClarificationPayload.
    If a mock client is configured, returns the mock client instead.
    """
    if _mock_clarification_client is not None:
        return _mock_clarification_client

    llm = get_extraction_llm_with_fallback()
    return llm.with_structured_output(RawClarificationPayload)
