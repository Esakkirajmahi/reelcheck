# ReelCheck

AI-powered reel authenticity analyzer. Upload any video and get instant analysis of claims, persuasion tactics, visual authenticity, and hidden resources.

**100% free to run** — uses Gemini 1.5 Flash (Google AI Studio) + Groq Whisper.

---

## Prerequisites

Install these system tools first:

```bash
# macOS
brew install ffmpeg tesseract

# Ubuntu/Debian
sudo apt-get install ffmpeg tesseract-ocr

# Check they work
ffmpeg -version
tesseract --version
```

---

## Setup

### 1. Get free API keys

| Service | Where | Free limit |
|---|---|---|
| **Gemini** | https://aistudio.google.com → Get API Key | 1,500 req/day |
| **Groq** | https://console.groq.com → API Keys | 7,200 sec audio/day |

### 2. Backend setup

```bash
cd reelcheck/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and GROQ_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000

### 3. Frontend setup

```bash
cd reelcheck/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## How it works

```
User uploads reel
      ↓
FastAPI receives the file
      ↓
ffmpeg extracts audio (WAV) + key frames (JPEG)
      ↓
Groq Whisper transcribes the audio
      ↓
Tesseract OCR reads text from frames
      ↓
Gemini 1.5 Flash analyzes everything (text + images)
      ↓
Structured trust report returned to frontend
```

---

## API Endpoints

```
POST /api/analyze          Upload video → returns job_id
GET  /api/status/{job_id}  Poll job status and current stage
GET  /api/results/{job_id} Get full analysis results
```

---

## What gets analyzed

- **Claims** — Extracted and categorized (income, tools, outcomes, etc.)
- **Trust score** — 0–100 overall authenticity rating
- **Scam risk** — Low / Medium / High / Critical
- **Mentioned tools** — Websites, apps, and platforms referenced
- **Persuasion tactics** — Urgency, scarcity, engagement bait, FOMO, etc.
- **Hidden resources** — Inferred gated content ("comment to get the link")
- **Visual warnings** — Suspicious dashboards, fake screenshots, manipulated UIs
- **Transcript** — Full speech-to-text

---

## Cost: $0

- Gemini 1.5 Flash: Free (1,500 requests/day)
- Groq Whisper: Free (7,200 seconds audio/day)
- Tesseract OCR: Free (runs locally)
- ffmpeg: Free (runs locally)
- Everything else: Free

Start paying only when you need to scale beyond free tier limits.

---

## Project structure

```
reelcheck/
├── backend/
│   ├── main.py                        ← FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── api/routes.py              ← API endpoints
│       ├── core/config.py             ← Settings
│       ├── storage/job_store.py       ← JSON-based job storage
│       └── services/
│           ├── video_service.py       ← ffmpeg processing
│           ├── transcription_service.py ← Groq Whisper
│           ├── ocr_service.py         ← Tesseract OCR
│           ├── gemini_service.py      ← Gemini AI analysis
│           └── pipeline_service.py   ← Orchestration
└── frontend/
    ├── app/
    │   ├── page.tsx                   ← Upload / landing page
    │   └── analyze/[jobId]/page.tsx   ← Results page
    ├── components/
    │   ├── upload/                    ← DropZone, ProgressPipeline
    │   └── analysis/                  ← TrustMeter, ClaimCard, etc.
    └── lib/
        ├── api.ts                     ← API client
        ├── types.ts                   ← TypeScript types
        └── utils.ts                   ← Color helpers, formatters
```
