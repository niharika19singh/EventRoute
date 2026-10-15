"""EventRoute Backend Application Entrypoint.
FastAPI server connecting TinyFish Web Agent, OSRM Routing, and Event Normalization.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS, ENVIRONMENT, HOST, PORT
from app.routers import events, colleges, routing, tinyfish
from app.services.tinyfish_service import tinyfish_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("eventroute")

app = FastAPI(
    title="EventRoute API — Navigate the Opportunity",
    description="Backend API for discovering college events and computing verified journey routes.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = ALLOWED_ORIGINS if "*" not in ALLOWED_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(events.router)
app.include_router(colleges.router)
app.include_router(routing.router)
app.include_router(tinyfish.router)


@app.get("/")
async def root():
    return {
        "name": "EventRoute — Navigate the Opportunity",
        "description": "Discover inter-college events geographically and plan journeys.",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "tinyfish": {
            "configured": tinyfish_service.is_configured(),
            "masked_key": tinyfish_service.get_masked_key(),
        },
        "endpoints": {
            "events": "/api/events",
            "colleges": "/api/colleges",
            "route": "/api/route",
            "tinyfish_status": "/api/tinyfish/status",
            "tinyfish_discover": "/api/tinyfish/discover",
            "health": "/api/health",
        },
    }


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "eventroute-backend",
        "version": "1.0.0",
        "tinyfish_configured": tinyfish_service.is_configured(),
        "environment": ENVIRONMENT,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=(ENVIRONMENT == "development"))
