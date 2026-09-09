from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from backend.app.api.deps import get_session
from backend.app.core.llm import (
    set_mock_extraction_client,
    clear_mock_extraction_client,
    set_mock_synthesis_client,
    clear_mock_synthesis_client,
    set_mock_critique_client,
    clear_mock_critique_client,
)
from backend.app.main import app
from backend.app.models.brief import (
    RawBriefPayload,
    RawBriefSection,
    RawCritiquePayload,
    CritiqueIssue,
    SectionKeyEnum,
)
from backend.app.models.extraction import (
    FactCategory,
    RawExtractionPayload,
    RawFactCandidate,
    RawUnknownCandidate,
)
from backend.app.models.project import Project, ProjectStatus
from backend.app.models.transcript import Transcript


@pytest.fixture(name="db_session")
def db_session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(db_session: Session):
    def get_session_override():
        return db_session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def clean_llm_mocks():
    yield
    clear_mock_extraction_client()
    clear_mock_synthesis_client()
    clear_mock_critique_client()


def test_analyze_interrupt_and_missing_transcript(client: TestClient, db_session: Session):
    # 1. Create a project without transcript
    project = Project(name="No Transcript Project")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    # 2. Analyze should fail with 400 Bad Request (D-09)
    resp = client.post(f"/api/v1/projects/{project.id}/analyze")
    assert resp.status_code == 400
    assert "No transcript found" in resp.json()["detail"]

    # 3. Add transcript to project
    transcript = Transcript(
        project_id=project.id,
        title="Discovery Call Transcript",
        raw_text="Client: We need a Python web application with SSO.",
        normalized_text="Client: We need a Python web application with SSO.",
    )
    db_session.add(transcript)
    db_session.commit()

    # 4. Mock extraction
    mock_extract = MagicMock()
    mock_extract.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Needs Python web application with SSO",
                source_quote="Python web application with SSO",
                speaker="Client",
                category=FactCategory.TECH_STACK,
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Which SSO identity provider?",
                impact_level="high",
                suggested_question="Which identity provider (Okta, Azure)?",
                category=FactCategory.TECH_STACK,
            )
        ],
    )
    set_mock_extraction_client(mock_extract)

    # 5. Analyze should succeed, halting at interrupt (CLARIFY-02)
    resp = client.post(f"/api/v1/projects/{project.id}/analyze")
    assert resp.status_code == 200
    data = resp.json()
    assert data["project_id"] == project.id
    assert data["status"] == ProjectStatus.AWAITING_CLARIFICATION
    assert len(data["confirmed_facts"]) == 1
    assert data["confirmed_facts"][0]["source_quote"] == "Python web application with SSO"
    assert len(data["clarification_questions"]) == 1

    # Verify project status in DB
    db_session.refresh(project)
    assert project.status == ProjectStatus.AWAITING_CLARIFICATION


def test_full_human_in_the_loop_workflow_lifecycle(client: TestClient, db_session: Session):
    """
    End-to-end integration test validating:
    CLARIFY-02: Interrupt after extraction
    CLARIFY-03: Resume with clarifications to draft brief
    BRIEF-03: Inspect brief and critique report
    BRIEF-04: Edit and approve brief
    """
    # 1. Setup project & transcript
    project = Project(name="End to End Brief Flow")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    transcript = Transcript(
        project_id=project.id,
        title="Full Flow Transcript",
        raw_text="Client: We want an automated billing dashboard. Budget is flexible.",
        normalized_text="Client: We want an automated billing dashboard. Budget is flexible.",
    )
    db_session.add(transcript)
    db_session.commit()

    # 2. Mock extraction
    mock_extract = MagicMock()
    mock_extract.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="Wants automated billing dashboard",
                source_quote="automated billing dashboard",
                speaker="Client",
                category=FactCategory.SCOPE,
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="What payment gateway (Stripe vs Adyen)?",
                impact_level="high",
                suggested_question="Which payment gateway do you use?",
                category=FactCategory.TECH_STACK,
            )
        ],
    )
    set_mock_extraction_client(mock_extract)

    # 3. Trigger analyze -> halts at interrupt
    resp_analyze = client.post(f"/api/v1/projects/{project.id}/analyze")
    assert resp_analyze.status_code == 200
    analyze_data = resp_analyze.json()
    assert analyze_data["status"] == ProjectStatus.AWAITING_CLARIFICATION
    question_id = analyze_data["clarification_questions"][0]["id"]

    # 4. Premature approve or get brief should fail cleanly
    resp_premature_brief = client.get(f"/api/v1/projects/{project.id}/brief")
    assert resp_premature_brief.status_code == 404

    resp_premature_approve = client.post(f"/api/v1/projects/{project.id}/approve")
    assert resp_premature_approve.status_code == 400

    # 5. Mock synthesis & critique
    mock_sections = {}
    for key in SectionKeyEnum:
        mock_sections[key.value] = RawBriefSection(
            title=key.value.replace("_", " ").title(),
            content=f"Generated draft content for {key.value}",
        )
    mock_synth = MagicMock()
    mock_synth.invoke.return_value = RawBriefPayload(sections=mock_sections)
    set_mock_synthesis_client(mock_synth)

    mock_critique = MagicMock()
    mock_critique.invoke.return_value = RawCritiquePayload(
        score=95,
        summary="High quality grounded brief.",
        issues=[],
    )
    set_mock_critique_client(mock_critique)

    # 6. Submit clarifications to resume graph (CLARIFY-03)
    clarify_payload = {
        "clarifications": [
            {
                "question_id": question_id,
                "resolved_text": "We use Stripe exclusively.",
                "resolved_by": "user",
            }
        ]
    }
    resp_clarify = client.post(
        f"/api/v1/projects/{project.id}/clarify",
        json=clarify_payload,
    )
    assert resp_clarify.status_code == 200
    clarify_data = resp_clarify.json()
    assert clarify_data["status"] == ProjectStatus.READY_FOR_REVIEW
    assert clarify_data["draft_brief"] is not None
    assert len(clarify_data["draft_brief"]["sections"]) == 11
    assert clarify_data["critique_report"]["score"] == 100

    # 7. Inspect brief via GET /brief (BRIEF-03)
    resp_get = client.get(f"/api/v1/projects/{project.id}/brief")
    assert resp_get.status_code == 200
    get_data = resp_get.json()
    assert get_data["status"] == "draft"
    assert get_data["draft_brief"] is not None
    assert get_data["approved_brief"] is None

    # 8. Approve brief with human edit (BRIEF-04)
    approve_payload = {
        "edited_brief": {
            "title": "Client Final Approved Billing Brief",
            "content": "Final human-approved brief text.",
        }
    }
    resp_approve = client.post(
        f"/api/v1/projects/{project.id}/approve",
        json=approve_payload,
    )
    assert resp_approve.status_code == 200
    approve_data = resp_approve.json()
    assert approve_data["status"] == ProjectStatus.APPROVED
    assert approve_data["approved_at"] is not None
    assert approve_data["approved_brief"]["title"] == "Client Final Approved Billing Brief"

    # 9. Verify subsequent GET returns approved state
    resp_get_after = client.get(f"/api/v1/projects/{project.id}/brief")
    assert resp_get_after.json()["status"] == "approved"
    assert resp_get_after.json()["approved_brief"]["title"] == "Client Final Approved Billing Brief"
