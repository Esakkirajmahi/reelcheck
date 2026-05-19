import json
import os
from datetime import datetime
from typing import Optional
from app.core.config import settings


def _job_path(job_id: str) -> str:
    return os.path.join(settings.DATA_DIR, f"{job_id}.json")


def create_job(job_id: str) -> dict:
    job = {
        "id": job_id,
        "status": "processing",
        "stage": "Starting...",
        "error": None,
        "result": None,
        "transcript": None,
        "created_at": datetime.utcnow().isoformat(),
        "completed_at": None,
    }
    with open(_job_path(job_id), "w") as f:
        json.dump(job, f)
    return job


def update_job(job_id: str, **kwargs) -> Optional[dict]:
    job = get_job(job_id)
    if not job:
        return None
    job.update(kwargs)
    with open(_job_path(job_id), "w") as f:
        json.dump(job, f)
    return job


def get_job(job_id: str) -> Optional[dict]:
    path = _job_path(job_id)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def complete_job(job_id: str, result: dict, transcript: str):
    update_job(
        job_id,
        status="completed",
        stage="Analysis complete",
        result=result,
        transcript=transcript,
        completed_at=datetime.utcnow().isoformat(),
    )


def fail_job(job_id: str, error: str):
    update_job(
        job_id,
        status="failed",
        stage="Failed",
        error=error,
        completed_at=datetime.utcnow().isoformat(),
    )
