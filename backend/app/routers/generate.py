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
    mode: str = "images"   # "images" or "video"
    duration: int = 5      # video only: 5 or 10 seconds

STYLE_MODIFIERS = {
    "cinematic":  "cinematic, film grain, dramatic lighting, high contrast, professional cinematography",
    "trippy":     "psychedelic, abstract, fluid simulation, neon colors, fractal patterns, surreal",
    "abstract":   "abstract art, geometric shapes, color gradients, minimalist, modern art",
    "anime":      "anime style, vibrant colors, dynamic motion, cel shading, japanese animation",
    "dark":       "dark atmosphere, moody lighting, shadows, noir style, dramatic",
    "nature":     "nature, organic, flowing water, forest, ethereal light, peaceful",
}

MOOD_MODIFIERS = {
    "energetic": "fast motion, dynamic, explosive energy, high contrast",
    "upbeat":    "bright colors, cheerful, vibrant, lively",
    "moderate":  "balanced, smooth transitions, natural flow",
    "mellow":    "soft colors, gentle motion, calm atmosphere",
    "ambient":   "slow motion, dreamy, ethereal, floating",
}

async def run_image_generation(job_id: str, request: GenerateRequest):
    try:
        import fal_client
        job_store[job_id]["status"] = "generating"
        style_mod   = STYLE_MODIFIERS.get(request.style, "")
        mood_mod    = MOOD_MODIFIERS.get(request.mood, "")
        full_prompt = f"{request.prompt}, {style_mod}, {mood_mod}, 4K, high quality, detailed"
        negative    = request.negative_prompt or "blurry, low quality, watermark, text, ugly, deformed"
        num_images  = 4
        results     = []
        for i in range(num_images):
            job_store[job_id]["logs"].append(f"Generating image {i+1}/{num_images}...")
            result = fal_client.subscribe(
                "fal-ai/flux/schnell",
                arguments={
                    "prompt": f"{full_prompt}, variation {i+1}",
                    "negative_prompt": negative,
                    "num_inference_steps": 4,
                    "image_size": "landscape_16_9",
                    "num_images": 1,
                },
            )
            if result and result.get("images"):
                results.append({"type": "image", "url": result["images"][0]["url"]})
                job_store[job_id]["frames"] = [r["url"] for r in results]
            job_store[job_id]["progress"] = int((i + 1) / num_images * 100)
        job_store[job_id]["status"]   = "complete"
        job_store[job_id]["progress"] = 100
        job_store[job_id]["frames"]   = [r["url"] for r in results]
        job_store[job_id]["results"]  = results
    except Exception as e:
        traceback.print_exc()
        job_store[job_id]["status"] = "error"
        job_store[job_id]["error"]  = str(e)

async def run_video_generation(job_id: str, request: GenerateRequest):
    try:
        import fal_client
        job_store[job_id]["status"] = "generating"
        style_mod   = STYLE_MODIFIERS.get(request.style, "")
        mood_mod    = MOOD_MODIFIERS.get(request.mood, "")
        full_prompt = f"{request.prompt}, {style_mod}, {mood_mod}, 4K, cinematic, high quality"
        negative    = request.negative_prompt or "blurry, low quality, watermark, text, ugly, static"
        num_clips   = 2
        results     = []
        for i in range(num_clips):
            job_store[job_id]["logs"].append(f"Generating video clip {i+1}/{num_clips} (~1-2 min)...")
            result = fal_client.subscribe(
                "fal-ai/kling-video/v2.1/master/text-to-video",
                arguments={
                    "prompt": f"{full_prompt}, scene {i+1}",
                    "negative_prompt": negative,
                    "duration": str(request.duration),
                    "aspect_ratio": "16:9",
                    "cfg_scale": 0.5,
                },
            )
            if result and result.get("video"):
                results.append({"type": "video", "url": result["video"]["url"]})
                job_store[job_id]["videos"] = results
            job_store[job_id]["progress"] = int((i + 1) / num_clips * 100)
        job_store[job_id]["status"]   = "complete"
        job_store[job_id]["progress"] = 100
        job_store[job_id]["videos"]   = results
        job_store[job_id]["results"]  = results
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
            "mode":     request.mode,
            "frames":   [],
            "videos":   [],
            "results":  [],
            "logs":     [],
            "error":    None,
            "request":  request.model_dump(),
        }
        if request.mode == "video":
            background_tasks.add_task(run_video_generation, job_id, request)
        else:
            background_tasks.add_task(run_image_generation, job_id, request)
        return JSONResponse({"job_id": job_id, "status": "queued", "mode": request.mode})
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
