"""
Backwards-compatibility module forwarding to modular graph components.
Canonical definition now resides in `backend.app.graph.nodes.generate_clarifications`.
"""
from backend.app.graph.nodes.generate_clarifications import (
    generate_clarifications_node,
    QUESTION_SYNTHESIS_SYSTEM_PROMPT,
)

__all__ = [
    "generate_clarifications_node",
    "QUESTION_SYNTHESIS_SYSTEM_PROMPT",
]
