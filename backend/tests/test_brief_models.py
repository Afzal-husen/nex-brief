import pytest
from backend.app.models.brief import (
    SectionKeyEnum,
    SECTION_TITLES,
    BriefSection,
    ProjectBrief,
    UserClarification,
    CritiqueIssue,
    CritiqueReport,
    RawBriefPayload,
    RawBriefSection,
)


def test_brief_section_model():
    sec = BriefSection(
        key=SectionKeyEnum.SCOPE_OF_WORK.value,
        title="In-Scope Deliverables & Features",
        content="Deliverable 1: User auth\nDeliverable 2: Dashboard",
        source_fact_ids=["fact-1", "fact-2"],
        inference_ids=["inf-1"],
        supporting_clarification_ids=["clar-1"],
    )
    assert sec.key == "scope_of_work"
    assert len(sec.source_fact_ids) == 2
    assert sec.supporting_clarification_ids == ["clar-1"]


def test_project_brief_model():
    sections = {}
    for k, v in SECTION_TITLES.items():
        sections[k] = BriefSection(
            key=k,
            title=v,
            content="Sample content for " + v,
        )

    brief = ProjectBrief(
        project_id="proj-123",
        transcript_id="trans-456",
        sections=sections,
        full_markdown="# Project Brief\n\nFull text here",
    )
    assert len(brief.sections) == 11
    assert SectionKeyEnum.EXECUTIVE_SUMMARY.value in brief.sections
    assert SectionKeyEnum.OUTSTANDING_QUESTIONS.value in brief.sections
    assert "Full text here" in brief.full_markdown


def test_user_clarification_model():
    clar = UserClarification(
        question_id="q-1",
        resolved_text="Our budget is strictly $45k and cannot exceed this amount.",
        resolved_by="user",
    )
    assert clar.question_id == "q-1"
    assert clar.resolved_by == "user"


def test_critique_report_model():
    issue = CritiqueIssue(
        section_key="scope_of_work",
        issue_type="ungrounded_claim",
        severity="critical",
        explanation="Mentions Stripe checkout, but client never stated Stripe in transcript.",
        suggested_fix="Verify payment processor or mark as assumption.",
    )
    report = CritiqueReport(
        score=80,
        summary="Brief is largely grounded, but Section 4 includes ungrounded payment processor.",
        issues=[issue],
    )
    assert report.score == 80
    assert len(report.issues) == 1
    assert report.issues[0].severity == "critical"
