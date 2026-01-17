"""
Health and status API routes
"""
from fastapi import APIRouter
from datetime import datetime

from app.core.database import fetch_one

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "brahma26-api"
    }

@router.get("/db")
async def database_check():
    """Check database connectivity."""
    try:
        result = fetch_one("SELECT COUNT(*) as count FROM events")
        return {
            "status": "connected",
            "events_count": result.get("count", 0) if result else 0
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
