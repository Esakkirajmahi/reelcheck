import os
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl

from app.core.config import settings
from app.services.download_service import is_supported_url
from app.services.pipeline_service import run_pipeline, run_pipeline_from_url
from app.storage.job_store import create_job, get_job

router = APIRouter()


class UrlRequest(BaseModel):
    url: str


ALLOWED_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
    "video/mpeg",
}
MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/analyze")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            400,
            f"Unsupported file type: {file.content_type}. Please upload MP4, MOV, or WebM.",
        )

    content = await file.read()

    if len(content) > MAX_BYTES:
        raise HTTPException(400, f"File too large. Maximum allowed size is {settings.MAX_FILE_SIZE_MB}MB.")

    job_id = str(uuid4())
    video_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}.mp4")

    with open(video_path, "wb") as f:
        f.write(content)

    create_job(job_id)
    background_tasks.add_task(run_pipeline, job_id, video_path)

    return {"job_id": job_id, "status": "processing"}


@router.post("/analyze-url")
async def analyze_url(
    background_tasks: BackgroundTasks,
    request: UrlRequest,
):
    url = request.url.strip()

    if not url.startswith("http"):
        raise HTTPException(400, "Please provide a valid URL starting with http:// or https://")

    if not is_supported_url(url):
        raise HTTPException(
            400,
            "Unsupported platform. Supported: Instagram, YouTube, TikTok, Facebook, Twitter/X.",
        )

    job_id = str(uuid4())
    create_job(job_id)
    background_tasks.add_task(run_pipeline_from_url, job_id, url)

    return {"job_id": job_id, "status": "processing"}


@router.get("/status/{job_id}")
async def get_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return {
        "job_id": job_id,
        "status": job["status"],
        "stage": job.get("stage", ""),
        "error": job.get("error"),
    }


@router.get("/results/{job_id}")
async def get_results(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    if job["status"] == "processing":
        return JSONResponse(
            status_code=202,
            content={"status": "processing", "stage": job.get("stage", "")},
        )

    if job["status"] == "failed":
        raise HTTPException(500, f"Analysis failed: {job.get('error', 'Unknown error')}")

    return {
        "job_id": job_id,
        "status": "completed",
        "result": job["result"],
        "transcript": job.get("transcript", ""),
        "created_at": job.get("created_at"),
        "completed_at": job.get("completed_at"),
    }
