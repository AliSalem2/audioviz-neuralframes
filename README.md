# 🎵 AudioViz — AI Music Video Generator

An audio-reactive AI video generator built with FastAPI + React/TypeScript.
Upload a track → analyze BPM/key/mood/stems → generate AI visuals synced to your music.

## Tech Stack
- **Backend**: FastAPI (Python), librosa, fal.ai
- **Frontend**: React, TypeScript, Vite, TailwindCSS, wavesurfer.js
- **Infra**: GCP Cloud Run (backend), Vercel (frontend)

## Local Development

### Backend
```bash
cd backend
cp .env.example .env        # Add your FAL_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Deploy

### Backend → GCP Cloud Run
```bash
export FAL_KEY=your_fal_key_here
chmod +x deploy.sh
./deploy.sh
```

### Frontend → Vercel
```bash
cd frontend
npx vercel
# Set VITE_API_URL to your Cloud Run URL
```

## API Endpoints
- `POST /api/audio/analyze` — Upload audio, get BPM/key/mood/stems
- `POST /api/generate/start` — Start AI generation job
- `GET  /api/status/{job_id}` — Poll job progress + frames
