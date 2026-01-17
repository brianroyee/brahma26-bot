"""
Events API routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
import requests
import os
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.database import fetch_all, fetch_one, execute
from app.core.security import get_current_user, require_role

router = APIRouter()

class EventBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    start_time: str
    end_time: str
    rules: Optional[str] = None
    hashtags: Optional[str] = None
    volunteer_contacts: Optional[str] = None
    poster_caption: Optional[str] = None
    poster_file_id: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    rules: Optional[str] = None
    hashtags: Optional[str] = None
    volunteer_contacts: Optional[str] = None
    poster_caption: Optional[str] = None
    poster_file_id: Optional[str] = None
    is_active: Optional[bool] = None

class EventResponse(EventBase):
    id: int
    is_active: bool
    created_at: Optional[str] = None

# Public routes
@router.get("/", response_model=List[dict])
async def list_events(
    category: Optional[str] = Query(None),
    active_only: bool = Query(True)
):
    """List all events, optionally filtered by category."""
    sql = "SELECT * FROM events WHERE 1=1"
    params = []
    
    if active_only:
        sql += " AND is_active = 1"
    if category:
        sql += " AND category = ?"
        params.append(category)
    
    sql += " ORDER BY start_time ASC"
    
    return fetch_all(sql, params if params else None)

@router.get("/categories")
async def list_categories():
    """Get list of unique event categories."""
    rows = fetch_all("SELECT DISTINCT category FROM events WHERE category IS NOT NULL ORDER BY category")
    return [row["category"] for row in rows if row.get("category")]

@router.get("/{event_id}")
async def get_event(event_id: int):
    """Get a single event by ID."""
    event = fetch_one("SELECT * FROM events WHERE id = ?", [event_id])
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{event_id}/poster")
async def get_event_poster(event_id: int):
    """Proxy Telegram poster image."""
    event = fetch_one("SELECT poster_file_id FROM events WHERE id = ?", [event_id])
    if not event or not event.get("poster_file_id"):
        raise HTTPException(status_code=404, detail="Poster not found")
    
    file_id = event["poster_file_id"]
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    # Get file path
    try:
        r = requests.get(f"https://api.telegram.org/bot{token}/getFile?file_id={file_id}", timeout=5)
        if r.status_code != 200:
            raise HTTPException(status_code=404, detail="File not found on Telegram")
        
        file_path = r.json().get("result", {}).get("file_path")
        if not file_path:
            raise HTTPException(status_code=404, detail="File path not found")
            
        # Stream file
        img_r = requests.get(f"https://api.telegram.org/file/bot{token}/{file_path}", stream=True, timeout=10)
        
        return StreamingResponse(
            img_r.iter_content(chunk_size=1024), 
            media_type=img_r.headers.get("Content-Type", "image/jpeg")
        )
    except Exception as e:
        print(f"Poster proxy error: {e}")
        raise HTTPException(status_code=500, detail="Error fetching poster")

# Protected routes (require auth)
@router.post("/", response_model=dict)
async def create_event(event: EventCreate, user: dict = Depends(require_role(["super_admin", "event_admin"]))):
    """Create a new event."""
    execute("""
        INSERT INTO events (name, category, description, venue, start_time, end_time, rules, hashtags, volunteer_contacts, poster_caption, poster_file_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        event.name, event.category, event.description, event.venue,
        event.start_time, event.end_time, event.rules, event.hashtags,
        event.volunteer_contacts, event.poster_caption, event.poster_file_id
    ])
    
    return {"message": "Event created", "name": event.name}

@router.put("/{event_id}")
async def update_event(event_id: int, event: EventUpdate, user: dict = Depends(require_role(["super_admin", "event_admin"]))):
    """Update an existing event."""
    existing = fetch_one("SELECT id FROM events WHERE id = ?", [event_id])
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Build dynamic update query
    updates = []
    params = []
    
    for field, value in event.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "is_active":
                updates.append(f"{field} = ?")
                params.append(1 if value else 0)
            else:
                updates.append(f"{field} = ?")
                params.append(value)
    
    if updates:
        params.append(event_id)
        execute(f"UPDATE events SET {', '.join(updates)} WHERE id = ?", params)
    
    return {"message": "Event updated", "id": event_id}

@router.delete("/{event_id}")
async def delete_event(event_id: int, user: dict = Depends(require_role(["super_admin"]))):
    """Soft delete an event (set is_active = 0)."""
    execute("UPDATE events SET is_active = 0 WHERE id = ?", [event_id])
    return {"message": "Event deleted", "id": event_id}
