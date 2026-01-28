# backend/app/guards/admin_guard.py
from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status, Request
from ..routers.auth import get_current_user_optional
from ..models import User
import os
import logging

logger = logging.getLogger("uvicorn")

async def get_admin_user(
    request: Request,
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
) -> User:
    """
    Dependency that ensures the current user is an admin OR valid internal secret is provided.
    Raises 403 Forbidden if user is not authorized.
    """
    
    # Check for Internal API Secret (for n8n)
    internal_secret = os.getenv("INTERNAL_API_SECRET")
    header_secret = request.headers.get("x-internal-secret") or request.headers.get("X-Internal-Secret")
    
    logger.info(f"DEBUG AUTH: Env Secret: {internal_secret}")
    logger.info(f"DEBUG AUTH: Header Secret: {header_secret}")
    
    if internal_secret and header_secret == internal_secret:
        # Create a dummy superuser for internal system actions
        logger.info("DEBUG AUTH: Authorized via Secret Key")
        return User(id="system", email="system@flowsaas.com", is_admin=True)

    # Standard User Authentication
    if not current_user:
        logger.warning("DEBUG AUTH: No user and invalid secret")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
        
    return current_user
