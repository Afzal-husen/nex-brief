from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from langgraph.checkpoint.memory import MemorySaver

from app.api.deps import get_session
from app.core.llm import (
    set_mock_extraction_client,
    clear_mock_extraction_client,
)
from app.main import app
from app.models.extraction import (
    FactCategory,
    RawExtractionPayload,
    RawFactCandidate,
    RawUnknownCandidate,
)
from app.models.project import Project, ProjectStatus
from app.models.transcript import Transcript
from app.services.workflow import trigger_project_analysis, get_project_analysis_details


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


def test_get_analysis_project_not_found(client: TestClient):
    response = client.get("/api/v1/projects/nonexistent-id/analysis")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_analysis_no_transcript(client: TestClient, db_session: Session):
    project = Project(id="proj-no-transcript", name="Test Proj", status=ProjectStatus.CREATED)
    db_session.add(project)
    db_session.commit()

    response = client.get(f"/api/v1/projects/{project.id}/analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == project.id
    assert data["status"] == ProjectStatus.CREATED
    assert data["confirmed_facts"] == []
    assert data["inferred_points"] == []
    assert data["contradictions"] == []
    assert data["unknown_gaps"] == []
    assert data["clarification_questions"] == []


def test_get_analysis_with_checkpoint(client: TestClient, db_session: Session):
    checkpointer = MemorySaver()

    project = Project(id="proj-with-check", name="Analyzed Proj", status=ProjectStatus.CREATED)
    db_session.add(project)
    db_session.commit()

    raw_transcript = (
        "Client: We need a secure mobile app for field inspectors.\n"
        "Alex: Will it need offline mode?\n"
        "Client: Yes, absolutely. Offline mode is critical for remote sites."
    )
    transcript = Transcript(
        id="trans-100",
        title="Discovery Call Transcript",
        project_id=project.id,
        raw_text=raw_transcript,
        normalized_text=raw_transcript,
    )
    db_session.add(transcript)
    db_session.commit()

    # Mock extraction LLM
    mock_extract = MagicMock()
    mock_extract.invoke.return_value = RawExtractionPayload(
        facts=[
            RawFactCandidate(
                statement="The mobile app requires offline mode for remote sites.",
                source_quote="Offline mode is critical for remote sites.",
                speaker="Client",
                category=FactCategory.SCOPE,
            )
        ],
        unknowns=[
            RawUnknownCandidate(
                missing_information="Target mobile platform (iOS vs Android)",
                impact_level="high",
                suggested_question="Which mobile platforms should be supported?",
                category=FactCategory.TECH_STACK,
            )
        ],
    )
    set_mock_extraction_client(mock_extract)

    # Trigger analysis using the in-memory checkpointer
    trigger_project_analysis(session=db_session, project_id=project.id, checkpointer_override=checkpointer)

    # Now verify get_project_analysis_details retrieves state from checkpointer
    analysis = get_project_analysis_details(
        session=db_session,
        project_id=project.id,
        checkpointer_override=checkpointer,
    )
    assert analysis["status"] == ProjectStatus.AWAITING_CLARIFICATION
    assert len(analysis["confirmed_facts"]) == 1
    assert analysis["confirmed_facts"][0].statement == "The mobile app requires offline mode for remote sites."
    assert analysis["confirmed_facts"][0].source_quote == "Offline mode is critical for remote sites."
    assert len(analysis["unknown_gaps"]) == 1
    assert "Target mobile platform" in analysis["unknown_gaps"][0].missing_information
    assert len(analysis["clarification_questions"]) >= 1

    # Call the GET endpoint (uses default checkpointer, graceful fallback when no state in default db)
    resp = client.get(f"/api/v1/projects/{project.id}/analysis")
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["project_id"] == project.id
    assert res_data["status"] == ProjectStatus.AWAITING_CLARIFICATION
