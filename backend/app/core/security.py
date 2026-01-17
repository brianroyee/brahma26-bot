"""
Simple Authentication (No JWT)
"""
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from app.core.config import settings

# Password handler
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()

# Static "Token" to use for session
SIMPLE_SESSION_TOKEN = "brahma26-authorized-session"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Return the static session token."""
    return SIMPLE_SESSION_TOKEN

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Validate the static token."""
    token = credentials.credentials
    
    if token != SIMPLE_SESSION_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid session token")
    
    # Return the simulated admin user
    return {
        "id": 1,
        "email": settings.ADMIN_EMAIL,
        "role": "super_admin"
    }

def require_role(required_roles: list):
    """Simple role check (always allows if logged in as super_admin)."""
    async def role_checker(user: dict = Depends(get_current_user)):
        return user
    return role_checker
