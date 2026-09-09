"""End-to-end integration and API tests for NexBrief backend."""
import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "nexbrief-backend"}


def test_project_lifecycle(client: TestClient):
    """Test Project creation, retrieval, listing, update, and deletion."""
    # 1. Create Project
    create_payload = {
        "name": "Fintech Mobile App",
        "description": "Discovery call with fintech founder",
    }
    response = client.post("/api/v1/projects", json=create_payload)
    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "Fintech Mobile App"
    assert project["description"] == "Discovery call with fintech founder"
    project_id = project["id"]
    assert project_id is not None

    # 2. Get Project
    response = client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["id"] == project_id

    # 3. List Projects
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 1
    assert any(p["id"] == project_id for p in projects)

    # 4. Update Project
    update_payload = {"name": "Fintech Mobile App V2"}
    response = client.patch(f"/api/v1/projects/{project_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Fintech Mobile App V2"

    # 5. Delete Project
    response = client.delete(f"/api/v1/projects/{project_id}")
    assert response.status_code == 204

    # 6. Verify 404
    response = client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 404


def test_transcript_ingestion_and_normalization(client: TestClient):
    """Test transcript creation, normalization, retrieval, and project relationship."""
    # 1. Create project
    proj_resp = client.post(
        "/api/v1/projects",
        json={"name": "Transcript Test Project", "description": "Testing normalization"},
    )
    project_id = proj_resp.json()["id"]

    # 2. Ingest transcript with curly quotes, excessive blank lines, and speaker labels
    raw_transcript = """
    Interviewer: What is your primary objective?
    
    
    
    Client: We need a “secure” multi-tenant system — ideally by Q3!
    """

    transcript_payload = {
        "title": "Initial Scoping Call",
        "source_type": "direct_paste",
        "raw_text": raw_transcript,
    }

    resp = client.post(f"/api/v1/projects/{project_id}/transcripts", json=transcript_payload)
    assert resp.status_code == 201
    transcript = resp.json()
    assert transcript["id"] is not None
    assert transcript["project_id"] == project_id
    assert transcript["title"] == "Initial Scoping Call"
    assert transcript["raw_text"] == raw_transcript

    # Verify normalized text replaces smart quotes and dashes while preserving speaker labels
    normalized = transcript["normalized_text"]
    assert '“' not in normalized
    assert '"secure"' in normalized
    assert "Interviewer: What is your primary objective?" in normalized
    assert "Client: We need a \"secure\" multi-tenant system -- ideally by Q3!" in normalized

    # 3. Retrieve transcript directly
    transcript_id = transcript["id"]
    get_resp = client.get(f"/api/v1/transcripts/{transcript_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == transcript_id

    # 4. List transcripts for project
    list_resp = client.get(f"/api/v1/projects/{project_id}/transcripts")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["id"] == transcript_id


def test_invalid_project_transcript_ingestion(client: TestClient):
    """Test that posting a transcript to a non-existent project returns 404."""
    resp = client.post(
        "/api/v1/projects/non-existent-id/transcripts",
        json={"title": "Test", "raw_text": "Some text"},
    )
    assert resp.status_code == 404
