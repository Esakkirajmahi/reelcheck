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


def run_pipeline(job_id: str, video_path: str):
    """Pipeline for uploaded video files."""
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
    """Pipeline for URL-based analysis — downloads first, then runs stages."""
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
    """Shared processing stages for both file and URL pipelines."""

    # Stage 1 — Extract audio and frames
    update_job(job_id, stage="Extracting audio and frames...")
    audio_path = os.path.join(work_dir, "audio.wav")
    frames_dir = os.path.join(work_dir, "frames")

    extract_audio(video_path, audio_path)
    frame_paths = extract_frames(video_path, frames_dir, max_frames=settings.MAX_FRAMES)

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
        api_key=settings.GEMINI_API_KEY,
    )

    complete_job(job_id, result=result, transcript=transcript)
    logger.info(f"[{job_id}] Pipeline completed successfully")
