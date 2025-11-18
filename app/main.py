"""
PneumAI - Unified FastAPI Backend
Lung Cancer Detection System with YOLOv12 Integration

Main application entry point with:
- FastAPI app initialization
- CORS middleware
- Static file serving
- Router registration
- Database connection pooling
- Startup/shutdown events
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from app.config import settings
from app.database import Database

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PneumAI API",
    description="Unified backend API for lung cancer detection and patient management",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# ============================================================
# CORS MIDDLEWARE
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"✅ CORS enabled for origins: {settings.ALLOWED_ORIGINS}")

# ============================================================
# STATIC FILE SERVING
# ============================================================

# Mount uploads directory for serving images
app.mount(
    "/uploads",
    StaticFiles(directory=str(settings.UPLOAD_DIR)),
    name="uploads"
)

logger.info(f"✅ Static files mounted at /uploads → {settings.UPLOAD_DIR}")

# ============================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on application startup"""
    logger.info("🚀 Starting PneumAI Backend...")

    # Validate configuration
    if not settings.validate():
        logger.error("❌ Configuration validation failed")
        raise Exception("Invalid configuration")

    # Initialize database connection pool
    if not Database.initialize():
        logger.error("❌ Database initialization failed")
        raise Exception("Database connection failed")

    logger.info("✅ PneumAI Backend started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on application shutdown"""
    logger.info("🛑 Shutting down PneumAI Backend...")

    # Close database connections
    Database.close()

    logger.info("✅ PneumAI Backend shutdown complete")


# ============================================================
# ROUTER REGISTRATION
# ============================================================

# Import routers (will be created in next phase)
# from app.routers import health, auth, patients, doctors, scans, appointments, messages

# Register health check router (basic implementation for now)
@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PneumAI Unified Backend API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "disabled in production"
    }


# Router registration (to be added in Phase 2)
# app.include_router(health.router, tags=["Health"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
# app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["Doctors"])
# app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])
# app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
# app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messages"])


# ============================================================
# APPLICATION ENTRY POINT
# ============================================================

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL
    )
