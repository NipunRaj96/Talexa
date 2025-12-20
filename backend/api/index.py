import sys
import os
from pathlib import Path

# Add backend directory to Python path for Vercel
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Add project root to path for automation module
project_root = backend_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

try:
    from app.main import app
except Exception as e:
    # Log the error for debugging
    import traceback
    error_msg = f"Failed to import app: {e}\n{traceback.format_exc()}"
    print(error_msg, file=sys.stderr)
    
    # Create a minimal error app
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI(title="Talexa API - Error")
    
    @app.get("/{path:path}")
    async def error_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application initialization failed",
                "message": str(e),
                "path": path
            }
        )

# Vercel requires the app instance to be available at the module level
# This file serves as the entry point for the Vercel serverless function
