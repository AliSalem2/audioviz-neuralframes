from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.store import job_store

router = APIRouter()

@router.get("/{job_id}")
async def get_status(job_id: str):
    """Poll the status of a generation job."""
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JSONResponse(job)

@router.get("/")
async def list_jobs():
    """List all jobs (most recent first)."""
    jobs = list(job_store.values())
    return JSONResponse({"jobs": jobs[-20:]})
