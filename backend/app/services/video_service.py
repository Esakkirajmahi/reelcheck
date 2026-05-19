import glob
import json
import logging
import os
import subprocess
from typing import List

logger = logging.getLogger(__name__)


def extract_audio(video_path: str, output_path: str) -> str:
    subprocess.run(
        [
            "ffmpeg", "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            output_path,
            "-y",
            "-loglevel", "error",
        ],
        check=True,
        capture_output=True,
    )
    return output_path


def extract_frames(video_path: str, output_dir: str, max_frames: int = 10) -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    output_pattern = os.path.join(output_dir, "frame_%04d.jpg")

    subprocess.run(
        [
            "ffmpeg", "-i", video_path,
            "-vf", "fps=0.5",
            "-q:v", "2",
            output_pattern,
            "-y",
            "-loglevel", "error",
        ],
        check=True,
        capture_output=True,
    )

    frames = sorted(glob.glob(os.path.join(output_dir, "frame_*.jpg")))

    if len(frames) > max_frames:
        step = max(1, len(frames) // max_frames)
        frames = frames[::step][:max_frames]

    logger.info(f"Extracted {len(frames)} frames from video")
    return frames


def get_video_duration(video_path: str) -> float:
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                video_path,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        info = json.loads(result.stdout)
        return float(info.get("format", {}).get("duration", 0))
    except Exception:
        return 0.0
