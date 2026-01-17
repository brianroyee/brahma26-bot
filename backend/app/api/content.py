"""
Content API routes (FAQs, emergency contacts, etc.)
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.core.database import fetch_all, fetch_one, execute
from app.core.security import require_role

router = APIRouter()

class ContentUpdate(BaseModel):
    content: str

# Public routes
@router.get("/")
async def list_content():
    """List all content pages."""
    return fetch_all("SELECT key, content, updated_at FROM content_pages ORDER BY key")

@router.get("/{key}")
async def get_content(key: str):
    """Get content by key."""
    content = fetch_one("SELECT key, content, updated_at FROM content_pages WHERE key = ?", [key])
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

# Protected routes
@router.put("/{key}")
async def update_content(key: str, data: ContentUpdate, user: dict = Depends(require_role(["super_admin", "content_manager"]))):
    """Update or create content page."""
    existing = fetch_one("SELECT id FROM content_pages WHERE key = ?", [key])
    
    if existing:
        execute(
            "UPDATE content_pages SET content = ?, updated_at = datetime('now') WHERE key = ?",
            [data.content, key]
        )
    else:
        execute(
            "INSERT INTO content_pages (key, content) VALUES (?, ?)",
            [key, data.content]
        )
    
    return {"message": "Content updated", "key": key}

@router.delete("/{key}")
async def delete_content(key: str, user: dict = Depends(require_role(["super_admin"]))):
    """Delete a content page."""
    execute("DELETE FROM content_pages WHERE key = ?", [key])
    return {"message": "Content deleted", "key": key}
