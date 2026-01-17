from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.core.database import fetch_one, execute, fetch_all
from app.core.security import require_role

router = APIRouter()

class Setting(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

@router.get("/", response_model=list[dict])
async def get_settings(user: dict = Depends(require_role(["super_admin", "admin", "viewer"]))):
    """Get all system settings."""
    settings = fetch_all("SELECT * FROM settings")
    return settings

@router.post("/")
async def update_setting(setting: Setting, user: dict = Depends(require_role(["super_admin", "admin"]))):
    """Update or create a system setting."""
    execute("""
        INSERT INTO settings (key, value, description, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            description = excluded.description,
            updated_at = datetime('now')
    """, [setting.key, setting.value, setting.description])
    
    return {"message": "Setting updated", "key": setting.key}
