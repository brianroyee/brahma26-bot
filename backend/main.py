"""
Brahma 26 Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import auth, events, content, health, announcements, telemetry, settings
from app.core.db_init import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 Brahma 26 API starting...")
    init_db()
    yield
    print("👋 Brahma 26 API shutting down...")

app = FastAPI(
    title="Brahma 26 API",
    description="Backend API for Brahma 26 Fest Information System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(content.router, prefix="/content", tags=["Content"])
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])
app.include_router(settings.router, prefix="/settings", tags=["Settings"])
app.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])

@app.get("/")
async def root():
    return {"message": "Brahma 26 API", "status": "running", "docs": "/docs"}
