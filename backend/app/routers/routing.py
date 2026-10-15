"""Routing API endpoints for EventRoute."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import RouteRequest, RouteResponse
from app.services.routing_service import routing_service

router = APIRouter(prefix="/api/route", tags=["routing"])


@router.post("", response_model=RouteResponse)
async def get_route(req: RouteRequest):
    """
    Calculate verified road route, distance, travel duration, GeoJSON polyline,
    and turn-by-turn navigation steps between origin college and event venue.
    """
    try:
        route = await routing_service.calculate_route(
            origin_lat=req.origin_lat,
            origin_lng=req.origin_lng,
            destination_lat=req.destination_lat,
            destination_lng=req.destination_lng,
            origin_name=req.origin_name or "Origin College",
            destination_name=req.destination_name or "Event Venue",
            mode=req.mode or "driving",
        )
        return route
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate route: {str(e)}")
