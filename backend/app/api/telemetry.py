from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.core.database import fetch_all, fetch_one, execute
from app.core.security import require_role

router = APIRouter()

class InteractionLog(BaseModel):
    telegram_id: int
    action: str
    metadata: Optional[str] = None

@router.post("/log")
async def log_interaction(log: InteractionLog):
    """Log a user interaction from the bot."""
    # Find user_id from telegram_id
    user = fetch_one("SELECT id FROM users WHERE telegram_id = ?", [log.telegram_id])
    if not user:
        # Auto-register if missing (fallback)
        execute("INSERT OR IGNORE INTO users (telegram_id, last_active) VALUES (?, datetime('now'))", [log.telegram_id])
        user = fetch_one("SELECT id FROM users WHERE telegram_id = ?", [log.telegram_id])
    
    if user:
        execute("""
            INSERT INTO telemetry (user_id, action, metadata, created_at)
            VALUES (?, ?, ?, datetime('now'))
        """, [user["id"], log.action, log.metadata])
        
        # Update last active
        execute("UPDATE users SET last_active = datetime('now') WHERE telegram_id = ?", [log.telegram_id])
    
    return {"status": "ok"}

@router.get("/stats")
async def get_analytics_stats(user: dict = Depends(require_role(["super_admin", "admin", "viewer"]))):
    """Get aggregated analytics stats."""
    
    # Total Users
    total_users = fetch_one("SELECT COUNT(*) as count FROM users")
    
    # Active Users (last 24h)
    active_users = fetch_one("""
        SELECT COUNT(*) as count FROM users 
        WHERE last_active > datetime('now', '-1 day')
    """)
    
    # Event Views (Top 5)
    top_events = fetch_all("""
        SELECT metadata as event_name, COUNT(*) as views 
        FROM telemetry 
        WHERE action = 'view_event' 
        GROUP BY metadata 
        ORDER BY views DESC 
        LIMIT 5
    """)
    
    # Interactions per day (Last 7 days)
    daily_activity = fetch_all("""
        SELECT date(created_at) as date, COUNT(*) as count 
        FROM telemetry 
        WHERE created_at > datetime('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date ASC
    """)
    
    return {
        "total_users": total_users["count"],
        "active_24h": active_users["count"],
        "top_events": top_events,
        "daily_activity": daily_activity
    }
