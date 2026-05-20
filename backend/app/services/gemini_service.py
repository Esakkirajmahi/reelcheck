import io
import json
import logging
import os
import re
import time
from typing import List

from google import genai
from google.genai import types
from PIL import Image

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """You are ReelCheck AI, an expert analyst for social media reel authenticity.

Your job is to analyze this reel's content and produce a balanced, evidence-based trust report.

TRANSCRIPT (spoken content):
{transcript}

TEXT VISIBLE ON SCREEN (OCR extracted):
{ocr_text}

Key video frames are attached as images above.

Return ONLY a valid JSON object — no markdown fences, no explanation — with exactly this structure:

{{
  "summary": "2-3 sentence description of what this reel is about and who made it",
  "content_type": "ai-tool | side-hustle | earn-money | govt-scheme | productivity | educational | business-advice | entertainment | other",
  "trust_score": <integer 0-100>,
  "trust_label": "trustworthy | mixed | suspicious | misleading",
  "trust_explanation": "explain the trust score with specific evidence from the content",
  "scam_risk_score": <integer 0-100>,
  "scam_risk_level": "low | medium | high | critical",
  "scam_risk_reasons": ["specific reason 1", "specific reason 2"],
  "claims": [
    {{
      "text": "exact claim made in the reel",
      "type": "income | tool | method | outcome | availability | authority",
      "verdict": "plausible | exaggerated | unverifiable | false_signal",
      "explanation": "brief evidence-based reasoning for verdict"
    }}
  ],
  "mentioned_tools": [
    {{
      "name": "exact tool, app, website, or platform name as mentioned",
      "category": "AI | SaaS | platform | app | website | course | govt | other",
      "context": "what the creator said or showed about this tool",
      "official_url": "the real official URL — e.g. https://chat.openai.com for ChatGPT. Use your knowledge. Never null if the tool is well-known.",
      "is_free": true or false or null,
      "pricing_note": "real pricing in one line — e.g. 'Free tier available, Pro at $20/month' or null if unknown",
      "claimed_vs_reality": "if creator made a specific claim about this tool, briefly contrast with reality — or null"
    }}
  ],
  "official_links": [
    {{
      "label": "short display name — e.g. 'ChatGPT', 'Canva', 'Indian PM Kisan Scheme'",
      "url": "verified official URL",
      "description": "one line: what this is and why it's relevant to this reel"
    }}
  ],
  "mentioned_products": [
    {{
      "name": "most specific possible product name — include brand + model number/name + color + material + style. e.g. 'Casio F-91W-1DG Black Dial Digital Watch' not just 'Casio watch'",
      "category": "watch | phone | clothing | accessories | electronics | home | beauty | other",
      "claimed_price": "price as stated in the reel — e.g. '₹249', 'under ₹250', or null",
      "claimed_platform": "Flipkart | Amazon | Meesho | Myntra | other | null",
      "visual_details": "describe all visible details: dial color, strap color/material, shape, size, any visible text/logo/model number on product",
      "search_query": "ultra-specific search query — include brand + model + color + material + distinguishing feature. e.g. 'Casio F91W black resin strap digital watch men'",
      "flipkart_search_url": "https://www.flipkart.com/search?q=SEARCH+QUERY+URL+ENCODED",
      "amazon_search_url": "https://www.amazon.in/s?k=SEARCH+QUERY+URL+ENCODED",
      "google_shopping_url": "https://www.google.com/search?q=SEARCH+QUERY+URL+ENCODED&tbm=shop",
      "price_plausibility": "plausible | low | suspicious",
      "price_note": "one line: is this price realistic for this specific product?"
    }}
  ],
  "persuasion_tactics": [
    {{
      "tactic": "urgency | scarcity | social_proof | engagement_bait | authority | fomo | before_after | false_promise | emotional_manipulation",
      "evidence": "exact quote or visual description that shows this tactic",
      "severity": "low | medium | high"
    }}
  ],
  "engagement_bait": {{
    "detected": true or false,
    "pattern": "describe the exact bait — e.g. 'Comment AI to get the tool list' or null",
    "note": "The actual resources mentioned in this reel are already listed above in mentioned_tools and official_links — no need to comment."
  }},
  "visual_warnings": [
    {{
      "concern": "brief description of the visual concern",
      "platform_shown": "Stripe | Shopify | trading-platform | ChatGPT | YouTube-Studio | PayPal | other | none",
      "verdict": "appears_genuine | suspicious | likely_manipulated",
      "explanation": "specific reasoning for this visual assessment"
    }}
  ],
  "what_appears_genuine": ["specific genuine element 1", "specific genuine element 2"],
  "what_appears_misleading": ["specific misleading element 1"],
  "recommended_action": "Clear, actionable advice for the viewer"
}}

ANALYSIS RULES:
- Return ONLY the JSON — nothing before or after it
- Be balanced and fair: many promotional reels are legitimate
- Only report what is actually visible or audible in the content
- Never fabricate tools or claims not present in the reel
- Use empty arrays [] for sections with nothing to report

OFFICIAL LINKS RULES:
- For EVERY tool, app, website, platform, or government scheme mentioned — provide its real official URL
- Use your training knowledge (e.g. ChatGPT → https://chat.openai.com, Canva → https://canva.com)
- For Indian government schemes: use official gov.in URLs
- Do NOT guess hidden links. Just list the official URL to whatever was shown/mentioned.
- official_links = the 1-5 most useful links from the whole reel in one place
- If the creator says "comment to get the link" — ignore the bait. Just list what was actually shown.

PRODUCT DETECTION RULES (critical for e-commerce reels):
- Examine ALL video frames carefully for physical products
- For EACH product visible, add an entry to mentioned_products
- NAME: Be as specific as Google Lens would be — include every visible detail: brand, model number/name, color, material, strap type, dial shape, size indicators, any text visible on the product itself
- VISUAL DETAILS: Describe exactly what you see — "black rectangular digital display, grey resin strap, silver case, Casio branding visible on dial"
- SEARCH QUERY: Make it ultra-specific. Instead of "Casio watch" write "Casio F91W black digital watch grey resin strap men". The more specific, the closer to the exact product.
- URL encode: spaces → +
- flipkart_search_url: https://www.flipkart.com/search?q=<encoded query>
- amazon_search_url: https://www.amazon.in/s?k=<encoded query>
- google_shopping_url: https://www.google.com/search?q=<encoded query>&tbm=shop
- If you can identify the exact model number from the product (e.g. F-91W, MQ-24, etc.), always include it in search_query
- price_plausibility: "plausible" if realistic, "low" if suspiciously cheap, "suspicious" if almost certainly fake

SCORING:
- Trust scores: 80-100 = trustworthy, 60-79 = mixed, 40-59 = suspicious, 0-39 = misleading
- Scam scores: 0-25 = low, 26-50 = medium, 51-75 = high, 76-100 = critical
- If no transcript and no meaningful visuals, give trust_score: 50 (insufficient data)"""


def _generate_with_retry(client: genai.Client, contents: list, max_attempts: int = 4):
    """Retry Gemini calls on transient 503/429 errors with exponential backoff."""
    delays = [5, 15, 30]
    last_error = None

    for attempt in range(max_attempts):
        try:
            return client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            last_error = e
            msg = str(e)
            is_transient = "503" in msg or "UNAVAILABLE" in msg or "429" in msg or "RESOURCE_EXHAUSTED" in msg
            if is_transient and attempt < max_attempts - 1:
                wait = delays[attempt]
                logger.warning(f"Gemini transient error (attempt {attempt+1}), retrying in {wait}s: {msg[:80]}")
                time.sleep(wait)
            else:
                break

    raise last_error


def _image_to_part(img_path: str) -> types.Part:
    img = Image.open(img_path).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return types.Part.from_bytes(data=buf.getvalue(), mime_type="image/jpeg")


def analyze_reel(
    transcript: str,
    ocr_text: str,
    frame_paths: List[str],
    api_key: str,
) -> dict:
    client = genai.Client(api_key=api_key)

    prompt_text = ANALYSIS_PROMPT.format(
        transcript=transcript.strip() if transcript else "No speech detected in this reel.",
        ocr_text=ocr_text.strip() if ocr_text else "No text detected on screen.",
    )

    contents: list = [prompt_text]

    frames_to_send = [p for p in frame_paths[:10] if os.path.exists(p)]
    for frame_path in frames_to_send:
        try:
            contents.append(_image_to_part(frame_path))
        except Exception as e:
            logger.warning(f"Could not load frame {frame_path}: {e}")

    logger.info(f"Sending {len(frames_to_send)} frames to Gemini")

    response = _generate_with_retry(client, contents)
    raw = response.text.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            result = json.loads(match.group())
        else:
            raise ValueError(f"Gemini returned unparseable response: {raw[:200]}")

    _apply_defaults(result)
    return result


def _apply_defaults(result: dict):
    defaults = {
        "claims": [],
        "mentioned_tools": [],
        "official_links": [],
        "persuasion_tactics": [],
        "mentioned_products": [],
        "engagement_bait": {"detected": False, "pattern": None, "note": None},
        "visual_warnings": [],
        "what_appears_genuine": [],
        "what_appears_misleading": [],
        "scam_risk_reasons": [],
        "trust_score": 50,
        "scam_risk_score": 30,
        "trust_label": "mixed",
        "scam_risk_level": "medium",
        "recommended_action": "Do your own research before acting on any claims in this reel.",
    }
    for key, val in defaults.items():
        result.setdefault(key, val)
