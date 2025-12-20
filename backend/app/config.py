"""Application configuration"""

from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Get the project root directory (parent of backend/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "Talexa API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # URLs
    FRONTEND_URL: str = "http://localhost:8080"
    BACKEND_URL: str = "http://localhost:8000"
    # Default origins for local development, override with ALLOWED_ORIGINS env var in production
    ALLOWED_ORIGINS: str = "http://localhost:8080,http://localhost:5173,http://localhost:3000,https://talexa.vercel.app"
    
    # Database
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "resumes"
    
    # AI Configuration
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"  # Fast model for development
    
    # Authentication
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Email (Optional)
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@talexa.com"
    SUPPORT_EMAIL: str = "support@talexa.com"
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_FILE_TYPES: str = "pdf,docx,doc"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Redis (Optional)
    REDIS_URL: str = "redis://localhost:6379"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated origins to list"""
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        # In production, allow all origins if ALLOWED_ORIGINS includes wildcard or is empty
        if self.ENVIRONMENT == "production" and "*" in self.ALLOWED_ORIGINS:
            return ["*"]
        return origins
    
    @property
    def allowed_file_types_list(self) -> List[str]:
        """Convert comma-separated file types to list"""
        return [ft.strip() for ft in self.ALLOWED_FILE_TYPES.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes"""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance
try:
    settings = Settings()
except Exception as e:
    # If settings fail to load, create a minimal settings object
    print(f"Warning: Failed to load settings: {e}")
    # This will be caught by the exception handler
    raise

# Create upload directory if it doesn't exist (only if path exists)
try:
    if settings.UPLOAD_DIR and settings.UPLOAD_DIR.parent.exists():
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception as e:
    print(f"Warning: Could not create upload directory: {e}")
