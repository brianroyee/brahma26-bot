"""
API Client for Brahma 26 Bot
Fetches data from the backend API.
"""
import os
import requests
from typing import Optional, List, Dict

API_BASE = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")

def get_events(category: Optional[str] = None, active_only: bool = True) -> List[Dict]:
    """Get list of events from API."""
    params = {"active_only": active_only}
    if category:
        params["category"] = category
    
    try:
        r = requests.get(f"{API_BASE}/events/", params=params, timeout=10)
        return r.json() if r.status_code == 200 else []
    except Exception:
        return []

def get_event(event_id: int) -> Optional[Dict]:
    """Get single event by ID."""
    try:
        r = requests.get(f"{API_BASE}/events/{event_id}", timeout=10)
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None

def get_categories() -> List[str]:
    """Get list of event categories."""
    try:
        r = requests.get(f"{API_BASE}/events/categories", timeout=10)
        return r.json() if r.status_code == 200 else []
    except Exception:
        return []

def get_content(key: str) -> Optional[str]:
    """Get content by key (faq, emergency_contacts, about)."""
    try:
        r = requests.get(f"{API_BASE}/content/{key}", timeout=10)
        if r.status_code == 200:
            return r.json().get("content")
        return None
    except Exception:
        return None

def log_interaction(telegram_id: int, action: str, metadata: Optional[str] = None):
    """Log user interaction via telemetry API."""
    try:
        requests.post(f"{API_BASE}/telemetry/log", json={
            "telegram_id": telegram_id,
            "action": action,
            "metadata": metadata
        }, timeout=1) 
    except Exception:
        pass # Fire and forget
