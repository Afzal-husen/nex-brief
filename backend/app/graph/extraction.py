"""
Backwards-compatibility module forwarding to modular graph components.
Canonical definitions now reside in:
- `app.graph.state`: ExtractionState
- `app.graph.builder`: build_extraction_graph
- `app.graph.nodes.extract_knowledge`: extract_knowledge
- `app.graph.nodes.verify_grounding`: verify_grounding
"""
from app.graph.state import ExtractionState
from app.graph.builder import build_extraction_graph
from app.graph.nodes.extract_knowledge import extract_knowledge, EXTRACTION_SYSTEM_PROMPT
from app.graph.nodes.verify_grounding import verify_grounding

__all__ = [
    "ExtractionState",
    "build_extraction_graph",
    "extract_knowledge",
    "verify_grounding",
    "EXTRACTION_SYSTEM_PROMPT",
]
