from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import requests
import os
import asyncio

from app.core.database import fetch_all, fetch_one, execute
from app.core.security import require_role

router = APIRouter()

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    target_all: bool = True

async def broadcast_message(title: str, message: str):
    """Background task to broadcast message to all users."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("Error: No bot token found for broadcast")
        return

    # Get all users
    users = fetch_all("SELECT telegram_id FROM users")
    
    full_text = f"📢 *{title}*\n\n{message}"
    
    success_count = 0
    fail_count = 0
    
    print(f"Starting broadcast to {len(users)} users...")
    
    for user in users:
        chat_id = user["telegram_id"]
        try:
            # Send message via Telegram API
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": full_text,
                "parse_mode": "Markdown"
            }
            r = requests.post(url, json=payload, timeout=5)
            if r.status_code == 200:
                success_count += 1
            else:
                fail_count += 1
                # Remove invalid users? Maybe later.
        except Exception as e:
            print(f"Failed to send to {chat_id}: {e}")
            fail_count += 1
            
        # Rate limit protection (approx 20-30 msgs/sec limit, but let's be safe with 0.1s delay)
        await asyncio.sleep(0.1)

    print(f"Broadcast complete. Success: {success_count}, Failed: {fail_count}")

@router.get("/", response_model=List[dict])
async def list_announcements():
    """List all announcements."""
    return fetch_all("SELECT * FROM announcements ORDER BY created_at DESC")

@router.post("/")
async def create_announcement(
    announcement: AnnouncementCreate, 
    background_tasks: BackgroundTasks,
    user: dict = Depends(require_role(["super_admin", "admin"]))
):
    """Create and broadcast an announcement."""
    
    # store in DB
    execute("""
        INSERT INTO announcements (title, message, created_at)
        VALUES (?, ?, datetime('now'))
    """, [announcement.title, announcement.message])
    
    # Trigger broadcast
    background_tasks.add_task(broadcast_message, announcement.title, announcement.message)
    
    return {"message": "Announcement created and broadcast started"}
