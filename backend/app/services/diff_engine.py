import difflib
from typing import Any, Optional
from backend.app.models.brief import SECTION_TITLES, SectionKeyEnum


def compute_unified_diff(draft: str, approved: str, section_key: str) -> Optional[str]:
    """
    Computes unified diff lines comparing draft to approved content.
    Returns unified diff patch string or None if identical.
    """
    if draft == approved:
        return None

    draft_lines = draft.splitlines(keepends=True)
    approved_lines = approved.splitlines(keepends=True)

    diff_lines = list(
        difflib.unified_diff(
            draft_lines,
            approved_lines,
            fromfile=f"draft/{section_key}",
            tofile=f"approved/{section_key}",
            lineterm="",
        )
    )
    return "\n".join(diff_lines) if diff_lines else None


def extract_section_text(brief_data: dict[str, Any], section_key: str) -> str:
    """
    Extracts text content for a given section key from a brief dict.
    Supports both nested BriefSection dicts and direct string content.
    """
    sections = brief_data.get("sections", {})
    if not isinstance(sections, dict):
        return ""

    section_entry = sections.get(section_key)
    if section_entry is None:
        return ""
    if isinstance(section_entry, dict):
        return str(section_entry.get("content", "") or "")
    if isinstance(section_entry, str):
        return section_entry
    if hasattr(section_entry, "content"):
        return str(section_entry.content or "")
    return str(section_entry)


def compute_section_diffs(
    draft_brief: dict[str, Any],
    approved_brief: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Compares all 11 brief sections between draft and approved briefs,
    producing structured diffs and metrics (EVAL-01 / Story 14).
    """
    results: list[dict[str, Any]] = []

    # Evaluate in canonical order
    for section_enum in SectionKeyEnum:
        key = section_enum.value
        draft_content = extract_section_text(draft_brief, key)
        approved_content = extract_section_text(approved_brief, key)

        has_changed = draft_content != approved_content
        diff_unified = compute_unified_diff(draft_content, approved_content, key)

        if not has_changed:
            similarity = 1.0
        else:
            similarity = round(
                difflib.SequenceMatcher(None, draft_content, approved_content).ratio(),
                4,
            )

        character_delta = len(approved_content) - len(draft_content)

        results.append(
            {
                "section_key": key,
                "draft_content": draft_content,
                "approved_content": approved_content,
                "has_changed": has_changed,
                "diff_unified": diff_unified,
                "similarity_ratio": similarity,
                "character_delta": character_delta,
            }
        )

    return results
