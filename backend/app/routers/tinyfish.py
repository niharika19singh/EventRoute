"""TinyFish API endpoints for EventRoute."""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.models.schemas import TinyFishStatus, TinyFishSearchRequest, TinyFishFetchRequest
from app.services.tinyfish_service import tinyfish_service
from app.routers.events import add_discovered_events

router = APIRouter(prefix="/api/tinyfish", tags=["tinyfish"])


@router.get("/status", response_model=Dict[str, Any])
async def get_tinyfish_status():
    """Diagnostic status of TinyFish Web Agent integration and masked API key."""
    return tinyfish_service.get_status()


@router.post("/discover", response_model=Dict[str, Any])
async def discover_events(
    query: Optional[str] = Query("Delhi college hackathon tech fest cultural 2026", description="Discovery search query"),
    add_to_catalog: bool = Query(True, description="Whether to add discovered events to the active catalog"),
):
    """
    Run complete TinyFish Search + Fetch + Normalize + Deduplicate discovery pipeline.
    Seamlessly discovers live inter-college events and integrates them into dashboard and map.
    """
    try:
        result = await tinyfish_service.run_discovery_pipeline(query=query)
        if add_to_catalog and result.get("events"):
            added_count = add_discovered_events(result["events"])
            result["added_to_active_catalog"] = added_count
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discovery pipeline failed: {str(e)}")


@router.post("/search", response_model=Dict[str, Any])
async def search_tinyfish(payload: TinyFishSearchRequest):
    """Direct invocation of TinyFish Search API."""
    res = await tinyfish_service.search_events(query=payload.query, purpose=payload.purpose)
    return res


@router.post("/fetch", response_model=Dict[str, Any])
async def fetch_tinyfish(payload: TinyFishFetchRequest):
    """Direct invocation of TinyFish Fetch API with URL list."""
    res = await tinyfish_service.fetch_urls(urls=payload.urls, purpose=payload.purpose)
    return res
