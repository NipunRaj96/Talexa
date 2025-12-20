"""FastAPI application entry point"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .database import init_db

# Import routers
from .routers import jobs_router, applications_router

# Create FastAPI app instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Recruitment Platform API",
    redirect_slashes=True  # Handle trailing slashes for Vercel
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        # Log error but don't fail startup (database might already exist)
        print(f"Database initialization warning: {e}")
        import traceback
        traceback.print_exc()

# Include routers
app.include_router(jobs_router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
# app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])  # TODO: Add after Google OAuth setup

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": settings.VERSION}

# Debug endpoint to see what paths are being received
@app.get("/{path:path}")
@app.post("/{path:path}")
@app.put("/{path:path}")
@app.delete("/{path:path}")
async def debug_path(request: Request, path: str):
    """Debug endpoint to see received paths"""
    return {
        "path": path,
        "full_path": str(request.url.path),
        "method": request.method,
        "available_routes": [route.path for route in app.routes]
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
