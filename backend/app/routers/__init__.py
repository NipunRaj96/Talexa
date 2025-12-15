"""Routers package"""

from .jobs import router as jobs_router
from .applications import router as applications_router
# from .auth import router as auth_router  # Will implement after Google OAuth setup

__all__ = ["jobs_router", "applications_router"]
