# Not sure if this is a optimized way for protected routing recheck it for me (copy understood. seems good to me but i think you know more about this than me)
from typing import Optional
from app.database.connection import get_db
from app.utils.jwt_manager import jwt_manager
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from app.services.user_service import user_service
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# HTTPBearer for extracting Authorization header
security = HTTPBearer(scheme_name="Access Token", auto_error=False)
uploads  = HTTPBearer(scheme_name="Upload Token", auto_error=True)

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

# For @Dhruvil, I'll remove this if it remains useless. 
async def get_optional_user(
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    if credentials is None:
        return None    
    try:
        token = credentials.credentials
        payload = jwt_manager.verify_token(token)
    
        if not payload:
            return None
        
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        user = await user_service.get_user_by_id(db, user_id)
        return user

    except Exception:
        # If anything fails, return None (not authenticated)
        return None

# def require_admin(user = Depends(get_current_user)):
#     # Check if user has admin attribute 
#     (Nigga need to add this to UserModel) 
#     (@Dhruvil Nah, There is no admin, we're making it for ourselves, not selling it to anyone. we can handle without admin portal)(will remove this part in next commit.)
#     if not hasattr(user, 'is_admin') or not user.is_admin:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Insufficient permissions"
#         )
#     return user