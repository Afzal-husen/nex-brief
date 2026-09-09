import json
import subprocess
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from backend.app.api.deps import get_session
from backend.app.main import app
from backend.app.models.brief import SECTION_TITLES, SectionKeyEnum
from backend.app.models.brief_record import ProjectBriefRecord
from backend.app.models.correction import CorrectionLog
from backend.app.models.project import Project, ProjectStatus
from backend.app.models.transcript import Transcript
from backend.app.services.diff_engine import compute_section_diffs
from backend.app.services.eval_service import (
    get_correction_logs,
    get_evaluation_dataset,
)
from backend.app.services.workflow import approve_project_brief
from backend.app.eval.export import run_export


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


def make_sample_brief_dict(title: str = "Test Brief") -> dict:
    sections = {}
    for key in SectionKeyEnum:
        sections[key.value] = {
            "key": key.value,
            "title": SECTION_TITLES[key.value],
            "content": f"Default synthesized content for {key.value}.",
            "source_fact_ids": [],
            "inference_ids": [],
            "supporting_clarification_ids": [],
        }
    return {
        "id": "brief-123",
        "title": title,
        "sections": sections,
        "full_markdown": "# Test Brief\n...",
    }


def test_compute_section_diffs():
    draft = make_sample_brief_dict()
    approved = make_sample_brief_dict()

    # Modify scope_of_work
    approved["sections"]["scope_of_work"]["content"] = (
        "Human revised content: In-scope includes Okta SSO and admin reporting."
    )

    diffs = compute_section_diffs(draft, approved)
    assert len(diffs) == 11

    scope_diff = next(d for d in diffs if d["section_key"] == "scope_of_work")
    assert scope_diff["has_changed"] is True
    assert scope_diff["similarity_ratio"] < 1.0
    assert scope_diff["diff_unified"] is not None
    assert "draft/scope_of_work" in scope_diff["diff_unified"]
    assert "approved/scope_of_work" in scope_diff["diff_unified"]
    assert scope_diff["character_delta"] > 0

    exec_diff = next(d for d in diffs if d["section_key"] == "executive_summary")
    assert exec_diff["has_changed"] is False
    assert exec_diff["similarity_ratio"] == 1.0
    assert exec_diff["diff_unified"] is None
    assert exec_diff["character_delta"] == 0


def test_approval_creates_correction_logs(db_session: Session):
    project = Project(name="Correction Logging Test", status=ProjectStatus.READY_FOR_REVIEW)
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    transcript = Transcript(
        title="Discovery Transcript",
        project_id=project.id,
        raw_text="Client: We need Okta SSO.",
        normalized_text="Client: We need Okta SSO.",
    )
    db_session.add(transcript)

    draft_brief = make_sample_brief_dict()
    brief_record = ProjectBriefRecord(
        project_id=project.id,
        draft_brief_json=json.dumps(draft_brief),
        status="draft",
    )
    db_session.add(brief_record)
    db_session.commit()

    # Approve with 2 modified sections
    approved_brief = make_sample_brief_dict()
    approved_brief["sections"]["scope_of_work"]["content"] = "Custom Scope: Okta SAML 2.0"
    approved_brief["sections"]["budget_commercials"]["content"] = "Fixed budget: $45,000 USD"

    result = approve_project_brief(
        session=db_session,
        project_id=project.id,
        edited_brief=approved_brief,
    )

    assert result["status"] == ProjectStatus.APPROVED

    # Query correction_logs table directly
    logs = list(db_session.exec(select(CorrectionLog).where(CorrectionLog.project_id == project.id)).all())
    assert len(logs) == 11

    changed_logs = [log for log in logs if log.has_changed]
    assert len(changed_logs) == 2
    changed_keys = {log.section_key for log in changed_logs}
    assert changed_keys == {"scope_of_work", "budget_commercials"}

    # Test idempotence: re-approving replaces existing logs
    approved_brief["sections"]["scope_of_work"]["content"] = "Updated Scope: Okta SAML 2.0 + SCIM"
    approve_project_brief(
        session=db_session,
        project_id=project.id,
        edited_brief=approved_brief,
    )
    logs_after = list(db_session.exec(select(CorrectionLog).where(CorrectionLog.project_id == project.id)).all())
    assert len(logs_after) == 11


def test_eval_api_endpoints(client: TestClient, db_session: Session):
    project = Project(name="Eval API Test", status=ProjectStatus.READY_FOR_REVIEW)
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    transcript = Transcript(
        title="Discovery Transcript",
        project_id=project.id,
        raw_text="Client: Timeline is 6 weeks.",
        normalized_text="Client: Timeline is 6 weeks.",
    )
    db_session.add(transcript)

    draft_brief = make_sample_brief_dict()
    brief_record = ProjectBriefRecord(
        project_id=project.id,
        draft_brief_json=json.dumps(draft_brief),
        status="draft",
    )
    db_session.add(brief_record)
    db_session.commit()

    # Approve with 1 modification
    approved_brief = make_sample_brief_dict()
    approved_brief["sections"]["timeline_milestones"]["content"] = "Strict 6-week timeline with 3 sprints."
    approve_project_brief(
        session=db_session,
        project_id=project.id,
        edited_brief=approved_brief,
    )

    # 1. GET /api/v1/eval/corrections (all)
    resp_all = client.get(f"/api/v1/eval/corrections?project_id={project.id}")
    assert resp_all.status_code == 200
    assert len(resp_all.json()) == 11

    # 2. GET /api/v1/eval/corrections?changed_only=true
    resp_changed = client.get(f"/api/v1/eval/corrections?project_id={project.id}&changed_only=true")
    assert resp_changed.status_code == 200
    changed_data = resp_changed.json()
    assert len(changed_data) == 1
    assert changed_data[0]["section_key"] == "timeline_milestones"
    assert changed_data[0]["has_changed"] is True

    # 3. GET /api/v1/eval/export?changed_only=true
    resp_export = client.get(f"/api/v1/eval/export?project_id={project.id}&changed_only=true")
    assert resp_export.status_code == 200
    assert "application/x-ndjson" in resp_export.headers["content-type"]
    
    export_lines = resp_export.text.strip().split("\n")
    assert len(export_lines) == 1
    record = json.loads(export_lines[0])
    assert record["project_id"] == project.id
    assert record["section_key"] == "timeline_milestones"
    assert record["transcript_context"] == "Client: Timeline is 6 weeks."
    assert "Strict 6-week timeline" in record["human_corrected_output"]
    assert record["has_changed"] is True


def test_cli_export(tmp_path: Path, db_session: Session):
    project = Project(name="CLI Export Test", status=ProjectStatus.READY_FOR_REVIEW)
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    transcript = Transcript(
        title="Discovery Transcript",
        project_id=project.id,
        raw_text="Client: Need dark mode UI.",
        normalized_text="Client: Need dark mode UI.",
    )
    db_session.add(transcript)

    draft_brief = make_sample_brief_dict()
    brief_record = ProjectBriefRecord(
        project_id=project.id,
        draft_brief_json=json.dumps(draft_brief),
        status="draft",
    )
    db_session.add(brief_record)
    db_session.commit()

    approved_brief = make_sample_brief_dict()
    approved_brief["sections"]["technical_architecture"]["content"] = "Tailwind CSS v4 with dark mode token set."
    approve_project_brief(
        session=db_session,
        project_id=project.id,
        edited_brief=approved_brief,
    )

    out_file = str(tmp_path / "eval_output.jsonl")
    dataset = run_export(
        output_path=out_file,
        project_id=project.id,
        changed_only=True,
        session=db_session,
    )

    assert len(dataset) == 1
    assert Path(out_file).exists()
    content = Path(out_file).read_text(encoding="utf-8").strip()
    parsed = json.loads(content)
    assert parsed["section_key"] == "technical_architecture"
    assert parsed["transcript_context"] == "Client: Need dark mode UI."
    assert "Tailwind CSS v4" in parsed["human_corrected_output"]
