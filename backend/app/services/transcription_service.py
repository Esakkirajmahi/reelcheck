import logging
import os

from groq import Groq

logger = logging.getLogger(__name__)


def transcribe_audio(audio_path: str, api_key: str) -> str:
    if not os.path.exists(audio_path):
        logger.warning("Audio file not found, skipping transcription")
        return ""

    if os.path.getsize(audio_path) < 1000:
        logger.warning("Audio file too small, likely no speech")
        return ""

    client = Groq(api_key=api_key)

    with open(audio_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            file=(os.path.basename(audio_path), f.read()),
            model="whisper-large-v3",
            response_format="text",
        )

    result = transcription if isinstance(transcription, str) else transcription.text
    logger.info(f"Transcribed {len(result)} characters")
    return result
