import glob
import logging
import os
import shutil
import tempfile

from app.core.config import settings
from app.services.download_service import download_video
from app.services.gemini_service import analyze_reel
from app.services.ocr_service import extract_text_from_frames
from app.services.transcription_service import transcribe_audio
from app.services.video_service import extract_audio, extract_frames
from app.storage.job_store import complete_job, fail_job, update_job

logger = logging.getLogger(__name__)

PUBLIC_FRAMES_DIR = "data/frames"
BACKEND_URL = os.environ.get("BACKEND_URL", "https://reelcheck-backend.onrender.com")


def run_pipeline(job_id: str, video_path: str):
    work_dir = tempfile.mkdtemp(prefix=f"reelcheck_{job_id}_")
    try:
        _run_stages(job_id, video_path, work_dir)
    except Exception as e:
        logger.error(f"[{job_id}] Pipeline failed: {e}", exc_info=True)
        fail_job(job_id, error=str(e))
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
        if os.path.exists(video_path):
            os.remove(video_path)


def run_pipeline_from_url(job_id: str, url: str):
    work_dir = tempfile.mkdtemp(prefix=f"reelcheck_{job_id}_")
    try:
        update_job(job_id, stage="Downloading video...")
        video_path = download_video(url, work_dir)
        _run_stages(job_id, video_path, work_dir)
    except Exception as e:
        logger.error(f"[{job_id}] URL pipeline failed: {e}", exc_info=True)
        fail_job(job_id, error=str(e))
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


def _run_stages(job_id: str, video_path: str, work_dir: str):
    # Stage 1 — Extract audio and frames
    update_job(job_id, stage="Extracting audio and frames...")
    audio_path = os.path.join(work_dir, "audio.wav")
    frames_dir = os.path.join(work_dir, "frames")

    extract_audio(video_path, audio_path)
    frame_paths = extract_frames(video_path, frames_dir, max_frames=settings.MAX_FRAMES)

    # Save frames to public directory so Google Lens can access them
    public_job_frames_dir = os.path.join(PUBLIC_FRAMES_DIR, job_id)
    public_frame_urls = _save_public_frames(frame_paths, public_job_frames_dir, job_id)

    # Stage 2 — Transcribe
    update_job(job_id, stage="Transcribing audio...")
    transcript = transcribe_audio(audio_path, settings.GROQ_API_KEY)

    # Stage 3 — OCR
    update_job(job_id, stage="Reading text from video frames...")
    ocr_text = extract_text_from_frames(frame_paths)

    # Stage 4 — AI Analysis
    update_job(job_id, stage="Analyzing content with AI...")
    result = analyze_reel(
        transcript=transcript,
        ocr_text=ocr_text,
        frame_paths=frame_paths,
        frame_urls=public_frame_urls,
        api_key=settings.GEMINI_API_KEY,
    )

    complete_job(job_id, result=result, transcript=transcript)
    logger.info(f"[{job_id}] Pipeline completed successfully")


def _save_public_frames(frame_paths: list, public_dir: str, job_id: str) -> list:
    """Copy frames to public static directory and return their public URLs."""
    os.makedirs(public_dir, exist_ok=True)
    urls = []
    for i, src_path in enumerate(frame_paths):
        if os.path.exists(src_path):
            filename = f"frame_{i:03d}.jpg"
            dst_path = os.path.join(public_dir, filename)
            shutil.copy2(src_path, dst_path)
            url = f"{BACKEND_URL}/frames/{job_id}/{filename}"
            urls.append(url)
    logger.info(f"Saved {len(urls)} public frames for job {job_id}")
    return urls
