"""
Backwards-compatibility module forwarding to modular graph components.
Canonical definition now resides in `app.graph.nodes.detect_contradictions`.
"""
from app.graph.nodes.detect_contradictions import (
    detect_contradictions_node,
    CONTRADICTION_DETECTION_SYSTEM_PROMPT,
)

__all__ = [
    "detect_contradictions_node",
    "CONTRADICTION_DETECTION_SYSTEM_PROMPT",
]
