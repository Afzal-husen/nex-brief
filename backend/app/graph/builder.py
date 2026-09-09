from typing import Any
from langgraph.graph import StateGraph, START, END

from backend.app.graph.state import ExtractionState
from backend.app.graph.nodes import (
    extract_knowledge,
    verify_grounding,
    detect_contradictions_node,
    generate_clarifications_node,
)


def build_extraction_graph(checkpointer: Any = None) -> Any:
    """
    Constructs and compiles the 4-node LangGraph extraction state machine (D-05):
    extract_knowledge -> verify_grounding -> detect_contradictions -> generate_clarifications -> END
    """
    workflow = StateGraph(ExtractionState)

    workflow.add_node("extract_knowledge", extract_knowledge)
    workflow.add_node("verify_grounding", verify_grounding)
    workflow.add_node("detect_contradictions", detect_contradictions_node)
    workflow.add_node("generate_clarifications", generate_clarifications_node)

    workflow.add_edge(START, "extract_knowledge")
    workflow.add_edge("extract_knowledge", "verify_grounding")
    workflow.add_edge("verify_grounding", "detect_contradictions")
    workflow.add_edge("detect_contradictions", "generate_clarifications")
    workflow.add_edge("generate_clarifications", END)

    if checkpointer is not None:
        return workflow.compile(checkpointer=checkpointer)
    return workflow.compile()
