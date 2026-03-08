from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import librosa
import numpy as np
import tempfile
import os
import uuid

router = APIRouter()

@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Upload an audio file and extract BPM, key, mood, and stem energy levels.
    """
    if not file.filename.endswith(('.mp3', '.wav', '.ogg', '.flac', '.m4a')):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    # Save uploaded file to temp
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Load audio with librosa
        y, sr = librosa.load(tmp_path, duration=60)  # Analyze first 60s

        # BPM detection
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(round(float(np.mean(tempo)), 1))

        # Key detection using chroma features
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_mean = chroma.mean(axis=1)
        key_idx = int(np.argmax(chroma_mean))
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key = keys[key_idx]

        # Energy analysis per frequency band (simulating stems)
        # Split into frequency bands: sub-bass, bass, mid, high-mid, high
        stft = np.abs(librosa.stft(y))
        freqs = librosa.fft_frequencies(sr=sr)

        def band_energy(low_hz, high_hz):
            mask = (freqs >= low_hz) & (freqs < high_hz)
            return float(round(float(stft[mask].mean()), 4)) if mask.any() else 0.0

        stems = {
            "kick":    band_energy(20, 80),
            "bass":    band_energy(80, 250),
            "mid":     band_energy(250, 2000),
            "vocals":  band_energy(2000, 5000),
            "high":    band_energy(5000, 20000),
        }

        # Normalize stem energies to 0-1 range
        max_e = max(stems.values()) or 1
        stems_normalized = {k: round(v / max_e, 3) for k, v in stems.items()}

        # Mood estimation based on tempo + energy
        avg_energy = float(np.mean(np.abs(y)))
        if bpm > 140 and avg_energy > 0.05:
            mood = "energetic"
        elif bpm > 120:
            mood = "upbeat"
        elif bpm > 90:
            mood = "moderate"
        elif avg_energy < 0.02:
            mood = "ambient"
        else:
            mood = "mellow"

        # Duration
        duration = round(librosa.get_duration(y=y, sr=sr), 1)

        # Generate a session ID for this audio
        session_id = str(uuid.uuid4())

        return JSONResponse({
            "session_id": session_id,
            "filename": file.filename,
            "duration": duration,
            "bpm": bpm,
            "key": key,
            "mood": mood,
            "stems": stems_normalized,
            "sample_rate": sr,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")
    finally:
        try:
            os.unlink(tmp_path)
        except:
            pass
