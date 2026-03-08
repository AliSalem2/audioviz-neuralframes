from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import uuid
import traceback
from typing import Optional
from app.store import job_store

router = APIRouter()

class GenerateRequest(BaseModel):
    session_id: str
    prompt: str
    style: str = "cinematic"
    bpm: float = 120
    mood: str = "upbeat"
    stems: dict = {}
    negative_prompt: Optional[str] = None

STYLE_MODIFIERS = {
    "cinematic":  "cinematic, film grain, dramatic lighting, high contrast",
    "trippy":     "psychedelic, abstract, fluid simulation, neon colors, fractal patterns",
    "abstract":   "abstract art, geometric shapes, color gradients, minimalist",
    "anime":      "anime style, vibrant colors, dynamic motion, cel shading",
    "dark":       "dark atmosphere, moody lighting, shadows, noir style",
    "nature":     "nature, organic, flowing water, forest, ethereal light",
}

MOOD_MODIFIERS = {
    "energetic": "fast motion, dynamic, explosive energy, high contrast",
    "upbeat":    "bright colors, cheerful, vibrant, lively",
    "moderate":  "balanced, smooth transitions, natural flow",
    "mellow":    "soft colors, gentle motion, calm atmosphere",
    "ambient":   "slow motion, dreamy, ethereal, floating",
}

async def run_generation(job_id: str, request: GenerateRequest):
    try:
        import fal_client
        job_store[job_id]["status"] = "generating"

        style_mod   = STYLE_MODIFIERS.get(request.style, "")
        mood_mod    = MOOD_MODIFIERS.get(request.mood, "")
        full_prompt = f"{request.prompt}, {style_mod}, {mood_mod}, 4K, high quality"
        negative    = request.negative_prompt or "blurry, low quality, watermark, text, ugly"

        num_images = 4
        results = []

        for i in range(num_images):
            frame_prompt = f"{full_prompt}, variation {i+1}"
            result = fal_client.subscribe(
                "fal-ai/flux/schnell",
                arguments={
                    "prompt": frame_prompt,
                    "negative_prompt": negative,
                    "num_inference_steps": 4,
                    "image_size": "landscape_16_9",
                    "num_images": 1,
                },
            )
            if result and result.get("images"):
                results.append(result["images"][0]["url"])

            job_store[job_id]["progress"] = int((i + 1) / num_images * 100)
            job_store[job_id]["frames"]   = results

        job_store[job_id]["status"]   = "complete"
        job_store[job_id]["progress"] = 100

    except Exception as e:
        traceback.print_exc()
        job_store[job_id]["status"] = "error"
        job_store[job_id]["error"]  = str(e)


@router.post("/start")
async def start_generation(request: GenerateRequest, background_tasks: BackgroundTasks):
    try:
        fal_key = os.getenv("FAL_KEY")
        if not fal_key:
            raise HTTPException(status_code=500, detail="FAL_KEY not configured in .env")

        os.environ["FAL_KEY"] = fal_key

        job_id = str(uuid.uuid4())
        job_store[job_id] = {
            "job_id":   job_id,
            "status":   "queued",
            "progress": 0,
            "frames":   [],
            "logs":     [],
            "error":    None,
            "request":  request.model_dump() if hasattr(request, "model_dump") else request.dict(),
        }

        background_tasks.add_task(run_generation, job_id, request)
        return JSONResponse({"job_id": job_id, "status": "queued"})

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))