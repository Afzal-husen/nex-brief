import argparse
import json
import sys
from pathlib import Path
from typing import Optional
from sqlmodel import Session

from app.core.database import engine
from app.services.eval_service import get_evaluation_dataset


def run_export(
    output_path: Optional[str] = None,
    project_id: Optional[str] = None,
    changed_only: bool = True,
    session: Optional[Session] = None,
) -> list[dict]:
    """
    Programmatic entry point for evaluation dataset export.
    Returns the dataset records and writes to output_path if provided.
    """
    def _export(sess: Session):
        return get_evaluation_dataset(
            session=sess,
            project_id=project_id,
            changed_only=changed_only,
        )

    if session:
        dataset = _export(session)
    else:
        with Session(engine) as sess:
            dataset = _export(sess)

    lines = [json.dumps(rec, ensure_ascii=False) for rec in dataset]
    payload = "\n".join(lines) + ("\n" if lines else "")

    if output_path:
        out_file = Path(output_path)
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(payload, encoding="utf-8")
    else:
        sys.stdout.write(payload)

    return dataset


def main():
    parser = argparse.ArgumentParser(
        description="Export NexBrief human correction evaluation dataset to JSONL (Story 14)."
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Path to output .jsonl file. If omitted, outputs to stdout.",
        default=None,
    )
    parser.add_argument(
        "-p",
        "--project-id",
        help="Optional project ID filter.",
        default=None,
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Export all sections including unmodified ones. Default is changed-only.",
    )

    args = parser.parse_args()
    changed_only = not args.all

    dataset = run_export(
        output_path=args.output,
        project_id=args.project_id,
        changed_only=changed_only,
    )

    if args.output:
        print(f"Successfully exported {len(dataset)} benchmark records to {args.output}")


if __name__ == "__main__":
    main()
