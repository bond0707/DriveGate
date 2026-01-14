from typing import Optional
from app.core.config import settings
from app.database.connection import get_db
from app.utils.jwt_manager import jwt_manager
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user_service import user_service
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

# APIKeyHeader for making sure that only calls from frontend are accepted.
api_access = APIKeyHeader(name="X-API-Key", scheme_name="Server API Key", auto_error=False)
# HTTPBearer for extraction upload header
uploads    = HTTPBearer(scheme_name="Upload Token", auto_error=False)
# HTTPBearer for extracting Authorization header
security   = HTTPBearer(scheme_name="Access Token", auto_error=False)

async def verify_api_key(
    key: Optional[str] = Security(api_access)
) -> str:
    if key is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Missing X-API-Key header"
        )

    if key != settings.BACKEND_API_KEY:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail      = "Invalid API Key",
        )

    return key

async def get_access_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    if credentials is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Authorization header missing",
            headers     = {"WWW-Authenticate": "Bearer"},
        )

    # Extract token
    token = credentials.credentials

    # Verify token
    payload = jwt_manager.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Invalid or expired token",
            headers     = {"WWW-Authenticate": "Bearer"}
        )

    return payload

async def get_upload_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(uploads)
):
    if credentials is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Authorization header missing",
            headers     = {"WWW-Authenticate": "Bearer"},
        )

    # Extract token
    token = credentials.credentials

    # Verify token
    payload = jwt_manager.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Invalid or expired token",
            headers     = {"WWW-Authenticate": "Bearer"}
        )

    return payload

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(get_access_token_payload),
):
    # Get user_id from token
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Invalid token payload"
        )

    # Get user from database
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail      = "User not found"
        )
    return user

