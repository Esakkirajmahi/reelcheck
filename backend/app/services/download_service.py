import glob
import logging
import os

import yt_dlp

logger = logging.getLogger(__name__)

SUPPORTED_DOMAINS = [
    "instagram.com", "instagr.am",
    "youtube.com", "youtu.be",
    "tiktok.com",
    "facebook.com", "fb.watch",
    "twitter.com", "x.com",
]

MAX_BYTES = 100 * 1024 * 1024  # 100MB


def is_supported_url(url: str) -> bool:
    return any(domain in url for domain in SUPPORTED_DOMAINS)


def download_video(url: str, output_dir: str) -> str:
    ydl_opts = {
        "format": "best[height<=720][ext=mp4]/best[height<=720]/best",
        "outtmpl": os.path.join(output_dir, "video.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "ignoreerrors": False,
        # Use iOS player client to bypass YouTube 403s
        "extractor_args": {"youtube": {"player_client": ["ios"]}},
    }

    logger.info(f"Downloading video from: {url}")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except yt_dlp.utils.DownloadError as e:
        msg = str(e)
        if "Private" in msg or "Login" in msg or "login" in msg:
            raise ValueError(
                "This content is private or requires login. "
                "Please download the video manually and upload it instead."
            )
        if ("has been removed" in msg or "no longer available" in msg
                or "This video is unavailable" in msg):
            raise ValueError("This video is no longer available or has been removed.")
        raise ValueError(f"Could not download video: {_clean_error(msg)}")

    # Find what yt-dlp saved
    files = glob.glob(os.path.join(output_dir, "video.*"))
    if not files:
        raise ValueError("Download completed but no video file was found.")

    video_path = files[0]

    if os.path.getsize(video_path) > MAX_BYTES:
        os.remove(video_path)
        raise ValueError("Video is too large (max 100MB). Try a shorter clip.")

    logger.info(f"Downloaded to: {video_path} ({os.path.getsize(video_path) // 1024}KB)")
    return video_path


def _clean_error(msg: str) -> str:
    # Strip yt-dlp internal prefixes for cleaner user messages
    for prefix in ["ERROR: ", "[youtube] ", "[instagram] "]:
        msg = msg.replace(prefix, "")
    return msg.strip()[:200]
