# 🎵 AudioViz — AI Music Video Generator

A full-stack AI music video generator that analyzes your audio and generates synced visuals using state-of-the-art AI models. Built as a Neural Frames-inspired project.

## 🔗 Live Links

| | URL |
|---|---|
| **Frontend** | https://audioviz-neuralframes.vercel.app |
| **Backend API** | https://audioviz-backend-4c5ahhwtka-ew.a.run.app |
| **API Docs** | https://audioviz-backend-4c5ahhwtka-ew.a.run.app/docs |
| **GitHub** | https://github.com/AliSalem2/audioviz-neuralframes |

---

## 🚀 How It Works

### 1. Upload Audio
Drop any MP3, WAV, OGG, or FLAC file. The backend analyzes it instantly using **librosa** — a Python library for music and audio analysis.

### 2. Audio Analysis
The backend extracts:
- **BPM** — tempo of the track
- **Key** — musical key (e.g. D, A#, F)
- **Mood** — energy classification based on tempo and stem intensities
- **Stems** — frequency band breakdown (Kick, Bass, Mid, Vocals, High)

Based on the mood, a visual prompt is auto-suggested for you.

### 3. Choose Your Generation Mode

#### 🖼️ Images Mode (~$0.01 · ~10 seconds loading time)
Generates **4 AI still frames** using **FLUX Schnell** (by Black Forest Labs via fal.ai). Fast, cheap, great for previewing your visual style before committing to video.

#### 🎬 Video Mode (~$0.70 · 5 seconds ~2 minutes loading time)
Generates **2 cinematic video clips** (5s or 10s each) using **Kling v2.1 Master** (by Kuaishou via fal.ai). Full motion, 16:9, cinema-quality output. Each clip is independently prompted for variety.

### 4. Pick a Visual Style
| Style | Description |
|---|---|
| Cinematic | Film grain, dramatic lighting, high contrast |
| Trippy | Psychedelic, neon, fractal patterns, surreal |
| Abstract | Geometric shapes, color gradients, minimalist |
| Anime | Vibrant, dynamic motion, cel shading |
| Dark | Moody, noir, shadows, mysterious |
| Nature | Organic, flowing water, ethereal light |

### 5. Results
- Images render in a 2×2 grid with hover-to-download
- Videos autoplay looped with a Download MP4 button per clip

---

## 🔬 Understanding the Audio Analysis

When you upload a track, the app breaks it down into **frequency bands** (stems):

| Stem | Frequency Range | What It Represents |
|---|---|---|
| **Kick** | Sub-bass (20–80 Hz) | Bass drum hits, low-end punch |
| **Bass** | Bass (80–300 Hz) | Basslines, low synths, warmth |
| **Mid** | Midrange (300 Hz–4 kHz) | Guitars, synths, most instruments, vocals |
| **Vocals** | Upper-mid (1–8 kHz) | Voice presence, lead elements |
| **High** | Treble (4–20 kHz) | Hi-hats, cymbals, sparkle, air |

Each value is shown as a **0–100% intensity** relative to the loudest band in the track.

### Mood Classification
Mood is derived from BPM + overall stem energy:

| Mood | BPM Range | Character |
|---|---|---|
| Ambient | < 70 | Slow, dreamy, meditative |
| Mellow | 70–90 | Calm, relaxed, warm |
| Moderate | 90–110 | Balanced, natural flow |
| Upbeat | 110–140 | Bright, lively, cheerful |
| Energetic | > 140 | Intense, dynamic, explosive |

The mood is used to auto-suggest a visual prompt and influence how style and motion modifiers are applied to the AI generation.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — async Python API
- **librosa** — audio analysis (BPM, key, spectral features)
- **fal.ai** — AI model inference (FLUX, Kling)
- **Docker** — containerized for deployment
- **GCP Cloud Run** — serverless container hosting

### Frontend
- **React + TypeScript** — component-based UI
- **Vite** — fast dev/build tooling
- **TailwindCSS** — utility-first styling
- **wavesurfer.js** — audio waveform visualization
- **Vercel** — frontend hosting

### AI Models
| Model | Provider | Use |
|---|---|---|
| `fal-ai/flux/schnell` | Black Forest Labs | Image generation (4 frames) |
| `fal-ai/kling-video/v2.1/master/text-to-video` | Kuaishou | Video generation (2 clips) |

---

## 🏃 Running Locally

### Backend
```bash

uvicorn app.main:app --reload --port 8080
```

### Frontend
```bash
cd frontend
npm install

# Point to local backend
echo "VITE_API_URL=http://localhost:8080/api" > .env

npm run dev
```

Open http://localhost:5173

---

## ☁️ Deployment

### Backend → GCP Cloud Run
```bash
export FAL_KEY=your_fal_key
chmod +x deploy.sh
./deploy.sh
```

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set VITE_API_URL env var in Vercel dashboard to point to your Cloud Run URL
```

---

## 📁 Project Structure

```
audioviz-neuralframes/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── store.py         # In-memory job store
│   │   └── routers/
│   │       ├── audio.py     # POST /api/audio/analyze
│   │       ├── generate.py  # POST /api/generate/start (images + video)
│   │       └── status.py    # GET /api/status/{job_id}
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Waveform.tsx        # Audio waveform display
│       │   ├── StemVisualizer.tsx  # BPM/Key/Mood/Stems display
│       │   ├── StyleSelector.tsx   # Visual style picker
│       │   ├── ModeSelector.tsx    # Images vs Video toggle
│       │   └── Results.tsx         # Output display (images/video)
│       ├── services/api.ts         # API client
│       └── types/index.ts          # TypeScript types
└── deploy.sh                       # GCP Cloud Run deploy script
```
