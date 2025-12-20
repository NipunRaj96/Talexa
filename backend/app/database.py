"""Database connection and session management"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
# SQLite-specific configuration
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}  # Allow SQLite to work with FastAPI

# For PostgreSQL (Supabase), configure connection pooling for serverless
# Vercel serverless functions need connection pooling
pool_config = {}
if settings.DATABASE_URL.startswith("postgresql") or settings.DATABASE_URL.startswith("postgres"):
    # Use connection pooling for serverless environments
    pool_config = {
        "pool_size": 1,  # Small pool for serverless
        "max_overflow": 0,  # No overflow for serverless
        "pool_pre_ping": True,  # Verify connections before using
        "pool_recycle": 300,  # Recycle connections after 5 minutes
        "connect_args": {
            "connect_timeout": 10,  # 10 second timeout
            "sslmode": "require",  # Require SSL for Supabase
        }
    }

# Configure engine based on database type
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=settings.DEBUG,
    )
else:
       # PostgreSQL (Supabase) - use connection pooling for serverless
       # For Supabase, use the connection pooler URL (port 6543) instead of direct connection (port 5432)
       # Format: postgresql://user:pass@host:6543/dbname?pgbouncer=true
       db_url = settings.DATABASE_URL
       
       # Remove pgbouncer=true parameter - psycopg2 doesn't recognize it
       # The pooler URL works fine without this parameter
       if "?pgbouncer=true" in db_url:
           db_url = db_url.replace("?pgbouncer=true", "")
       elif "&pgbouncer=true" in db_url:
           db_url = db_url.replace("&pgbouncer=true", "")
       
       # If using direct connection, suggest using pooler
       if ":5432" in db_url:
           logger.warning(
               "Using direct PostgreSQL connection. For Vercel serverless, consider using "
               "Supabase connection pooler (port 6543) for better performance."
           )
       elif ":6543" in db_url:
           logger.info("Using Supabase connection pooler (port 6543)")
           
       engine = create_engine(
           db_url,
           connect_args=pool_config.get("connect_args", {}),
           pool_pre_ping=pool_config.get("pool_pre_ping", True),
           pool_size=pool_config.get("pool_size", 1),  # Small pool for serverless
           max_overflow=pool_config.get("max_overflow", 0),
           pool_recycle=pool_config.get("pool_recycle", 300),
           echo=settings.DEBUG,
       )
       logger.info("PostgreSQL engine created with connection pooling")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    
    Usage in FastAPI:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables"""
    # Import all models here to ensure they are registered
    from .models import job, application, user  # noqa
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
