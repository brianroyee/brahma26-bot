"""
Application configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Turso Database
    TURSO_DATABASE_URL: str = os.getenv("TURSO_DATABASE_URL", "")
    TURSO_AUTH_TOKEN: str = os.getenv("TURSO_AUTH_TOKEN", "")
    
    # JWT Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    
    # Admin defaults
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@brahma26.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    @property
    def database_url(self) -> str:
        """Get HTTPS database URL."""
        url = self.TURSO_DATABASE_URL
        if url.startswith("libsql://"):
            url = url.replace("libsql://", "https://")
        return url

settings = Settings()
