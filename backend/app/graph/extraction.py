"""
Backwards-compatibility module forwarding to modular graph components.
Canonical definitions now reside in:
- `backend.app.graph.state`: ExtractionState
- `backend.app.graph.builder`: build_extraction_graph
- `backend.app.graph.nodes.extract_knowledge`: extract_knowledge
- `backend.app.graph.nodes.verify_grounding`: verify_grounding
"""
from backend.app.graph.state import ExtractionState
from backend.app.graph.builder import build_extraction_graph
from backend.app.graph.nodes.extract_knowledge import extract_knowledge, EXTRACTION_SYSTEM_PROMPT
from backend.app.graph.nodes.verify_grounding import verify_grounding

__all__ = [
    "ExtractionState",
    "build_extraction_graph",
    "extract_knowledge",
    "verify_grounding",
    "EXTRACTION_SYSTEM_PROMPT",
]
