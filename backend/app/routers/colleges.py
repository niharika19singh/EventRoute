"""Colleges API endpoints for EventRoute."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query

from app.data.colleges_data import get_all_colleges, get_college_by_id
from app.services.spatial_service import spatial_service

router = APIRouter(prefix="/api/colleges", tags=["colleges"])


@router.get("", response_model=List[Dict[str, Any]])
async def list_colleges():
    """List all available colleges for origin selection and venue discovery."""
    return get_all_colleges()


@router.get("/nearest", response_model=List[Dict[str, Any]])
async def get_nearest_colleges(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lng: float = Query(..., ge=-180.0, le=180.0),
    limit: int = Query(5, ge=1, le=20),
):
    """Find nearest colleges to user coordinates using NumPy spatial sorting."""
    colleges = get_all_colleges()
    return spatial_service.find_nearest_colleges(lat, lng, colleges, k=limit)


@router.get("/{college_id}", response_model=Dict[str, Any])
async def get_college(college_id: str):
    """Retrieve college details by unique ID."""
    college = get_college_by_id(college_id)
    if not college:
        raise HTTPException(status_code=404, detail=f"College '{college_id}' not found")
    return college
