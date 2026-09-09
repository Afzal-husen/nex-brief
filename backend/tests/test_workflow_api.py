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
