"""Configuration settings for EventRoute."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current directory and parent directories
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY", "").strip() or None
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org").rstrip("/")
ROUTING_TIMEOUT_SECONDS = float(os.getenv("ROUTING_TIMEOUT_SECONDS", "6.0"))
TINYFISH_TIMEOUT_SECONDS = float(os.getenv("TINYFISH_TIMEOUT_SECONDS", "8.0"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "600"))

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,*").split(",")
    if o.strip()
]
