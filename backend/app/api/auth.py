"""
Authentication API routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.database import fetch_one, execute
from app.core.security import (
    hash_password, verify_password, create_access_token, get_current_user
)
from app.core.config import settings
from fastapi import Depends

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    role: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login and get access token."""
    user = fetch_one(
        "SELECT id, email, password_hash, role FROM admins WHERE email = ?",
        [request.email]
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["email"], "role": user["role"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "role": user["role"]}
    }

@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user info."""
    return {"id": user["id"], "email": user["email"], "role": user["role"]}

@router.post("/setup")
async def setup_admin():
    """Create initial admin user if none exists."""
    existing = fetch_one("SELECT id FROM admins LIMIT 1")
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    hashed = hash_password(settings.ADMIN_PASSWORD)
    execute(
        "INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)",
        [settings.ADMIN_EMAIL, hashed, "super_admin"]
    )
    
    return {"message": "Admin created", "email": settings.ADMIN_EMAIL}

@router.post("/force-reset")
async def force_reset_password():
    """Force reset admin password to match environment variable."""
    hashed = hash_password(settings.ADMIN_PASSWORD)
    execute(
        "UPDATE admins SET password_hash = ? WHERE email = ?",
        [hashed, settings.ADMIN_EMAIL]
    )
    return {"message": "Password reset", "email": settings.ADMIN_EMAIL}
@router.post("/register_bot_user")
async def register_bot_user(data: dict):
    """Register a Telegram user who started the bot."""
    telegram_id = data.get("telegram_id")
    username = data.get("username")
    
    if not telegram_id:
        raise HTTPException(status_code=400, detail="Missing telegram_id")
        
    execute("""
        INSERT OR IGNORE INTO users (telegram_id, username, created_at, last_active)
        VALUES (?, ?, datetime('now'), datetime('now'))
    """, [telegram_id, username])
    
    # Update last active if already exists
    execute("UPDATE users SET last_active = datetime('now') WHERE telegram_id = ?", [telegram_id])
    
    return {"message": "User registered"}


