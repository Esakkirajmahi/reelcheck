import logging
from typing import List

logger = logging.getLogger(__name__)


def extract_text_from_frames(frame_paths: List[str]) -> str:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        logger.warning("pytesseract/Pillow not installed — skipping OCR")
        return ""

    texts = []
    seen: set[str] = set()

    for path in frame_paths:
        try:
            img = Image.open(path)
            text = pytesseract.image_to_string(img, config="--psm 6").strip()

            if text and len(text) > 15 and text not in seen:
                texts.append(text)
                seen.add(text)
        except Exception as e:
            logger.warning(f"OCR failed for {path}: {e}")
            continue

    combined = "\n---\n".join(texts[:8])
    logger.info(f"OCR extracted {len(combined)} characters from {len(frame_paths)} frames")
    return combined
