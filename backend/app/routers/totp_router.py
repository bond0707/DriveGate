from app.schemas.totp import *
from app.models import UserModel
from fastapi import Depends, status, Request
from app.core.enums import DriveType
from fastapi.routing import APIRouter
from app.database.connection import get_db
from fastapi.exceptions import HTTPException
from app.utils.jwt_manager import jwt_manager
from app.schemas.generic import MessageResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.totp_service import totp_service
from app.services.user_service import user_service
from app.utils.rate_limiter import totp_rate_limiter
from app.utils.dependencies import get_current_user

totp_router = APIRouter()

@totp_router.get("/setup", response_model=TOTPSecretResponse, status_code=status.HTTP_200_OK)
async def return_random_totp_secret_and_uri(user: UserModel = Depends(get_current_user)):
    try:
        totp_secret = totp_service.generate_totp_secret()
        uri = totp_service.get_provisioning_uri(user.email, totp_secret)
        return {
            "totp_secret": totp_secret,
            "provisioning_uri": uri
        }
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = str(e)
        )

@totp_router.get("/rescan", response_model=TOTPSecretResponse, status_code=status.HTTP_200_OK)
async def return_current_totp_secret_and_uri(
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        totp_secret = await user_service.get_totp_secret_from_user_id_drive_type(db, user.id, DriveType.GOOGLE_DRIVE)
        
        if totp_secret is None:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail      = "TOTP Secret not found for the user!"
            )

        provisioning_uri = totp_service.get_provisioning_uri(user.email, totp_secret)
        return {
            "totp_secret": totp_secret,
            "provisioning_uri": provisioning_uri
        }
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = str(e)
        )

@totp_router.post("/store", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def verify_and_store_totp_secret(
    request: VerifyAndStoreTOTPRequest,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    is_valid = totp_service.verify_totp(
        request.user_totp,
        request.user_totp_secret
    )

    if not is_valid:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail      = "TOTP is invalid!"
        )

    try:
        user_drive = await user_service.update_totp_secret(
            db          = db,
            user_id     = user.id,
            drive_type  = DriveType.GOOGLE_DRIVE,
            totp_secret = request.user_totp_secret
        )

        if user_drive is None:
            raise Exception(f"No user drive found for user_id : {user.id} and drive_type : {DriveType.GOOGLE_DRIVE}")

        return {"message": "TOTP Secret successfully stored to DB."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f"Database Error: {str(e)}"
        )


@totp_router.post("/verify", response_model=UploadTokenResponse, status_code=status.HTTP_200_OK)
async def verify_totp(
    request: VerifyTOTPRequest,
    fastapi_request: Request, # This is added for using rate limit just for this 
    db: AsyncSession = Depends(get_db),
):
    # Retrieve the client's IP address from the request
    ip = fastapi_request.client.host # getting the ip
    
    # Check if the current combination of IP and URL Slug is blocked
    # This is the "secured" approach that prevents global IP blocks while protecting individual slugs
    remaining_time = totp_rate_limiter.is_blocked(ip, request.url_slug) 
    if remaining_time: # will return None if not blocked so it'll go to the next phase 
        
        minutes = remaining_time // 60
        seconds = remaining_time % 60
        time_str = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"
        
        raise HTTPException(
            status_code = status.HTTP_429_TOO_MANY_REQUESTS,
            detail      = f"Too many attempts for this slug. Blocked for {time_str}."
        )

    try:
        # Fetch the TOTP secret associated with the provided URL slug
        totp_secret = await user_service.get_totp_secret_by_url_slug(db, request.url_slug)

        if totp_secret is None:
            raise Exception(f"No totp_secret found for url_slug: {request.url_slug}")

        # Verify the provided TOTP against the stored secret
        if not totp_service.verify_totp(request.totp, totp_secret):
            # If verification fails, record the failure for this IP + Slug
            totp_rate_limiter.record_failure(ip, request.url_slug)
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail      = "Invalid TOTP!"
            )

        # On successful verification, reset the failure count for this IP + Slug
        # This allows the user to make fresh attempts if they were close to being blocked
        totp_rate_limiter.reset_attempts(ip, request.url_slug)
        
        # Generate and return a one-time upload token
        return {"upload_token": jwt_manager.create_upload_token(request.url_slug)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f"Database Error: {str(e)}"
        )