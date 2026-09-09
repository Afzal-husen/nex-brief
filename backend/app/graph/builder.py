from typing import Any
from langgraph.graph import StateGraph, START, END

from backend.app.graph.state import ExtractionState
from backend.app.graph.nodes import (
    extract_knowledge,
    verify_grounding,
    detect_contradictions_node,
    generate_clarifications_node,
    synthesize_brief_node,
    critique_brief_node,
)


def build_extraction_graph(
    checkpointer: Any = None,
    interrupt_before: list[str] | None = None,
) -> Any:
    """
    Constructs and compiles the 6-node LangGraph extraction and brief synthesis state machine (D-15):
    extract_knowledge -> verify_grounding -> detect_contradictions -> generate_clarifications -> synthesize_brief -> critique_brief -> END
    """
    workflow = StateGraph(ExtractionState)

    workflow.add_node("extract_knowledge", extract_knowledge)
    workflow.add_node("verify_grounding", verify_grounding)
    workflow.add_node("detect_contradictions", detect_contradictions_node)
    workflow.add_node("generate_clarifications", generate_clarifications_node)
    workflow.add_node("synthesize_brief", synthesize_brief_node)
    workflow.add_node("critique_brief", critique_brief_node)

    workflow.add_edge(START, "extract_knowledge")
    workflow.add_edge("extract_knowledge", "verify_grounding")
    workflow.add_edge("verify_grounding", "detect_contradictions")
    workflow.add_edge("detect_contradictions", "generate_clarifications")
    workflow.add_edge("generate_clarifications", "synthesize_brief")
    workflow.add_edge("synthesize_brief", "critique_brief")
    workflow.add_edge("critique_brief", END)

    compile_kwargs: dict[str, Any] = {}
    if checkpointer is not None:
        compile_kwargs["checkpointer"] = checkpointer
    if interrupt_before is not None:
        compile_kwargs["interrupt_before"] = interrupt_before

    return workflow.compile(**compile_kwargs)
