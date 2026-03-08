
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import audio, generate, status
import os


app = FastAPI(
    title="AudioViz API",
    description="Audio-reactive AI video generation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(status.router, prefix="/api/status", tags=["status"])

@app.get("/")
def root():
    return {"status": "AudioViz API is running 🎵"}

@app.get("/health")
def health():
    return {"status": "healthy"}
