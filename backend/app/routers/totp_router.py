from app.schemas.totp import *
from app.models import UserModel
from fastapi import Depends, status
from app.core.enums import DriveType
from fastapi.routing import APIRouter
from app.database.connection import get_db
from fastapi.exceptions import HTTPException
from app.utils.jwt_manager import jwt_manager
from app.schemas.generic import MessageResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.totp_service import totp_service
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user

totp_router = APIRouter()

@totp_router.get("/setup", response_model=TOTPSecretResponse, status_code=status.HTTP_200_OK)
async def return_totp_secret_and_uri(user: UserModel = Depends(get_current_user)):
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
    db: AsyncSession = Depends(get_db),
):
    try:
        totp_secret = await user_service.get_totp_secret_by_url_slug(db, request.url_slug)

        if totp_secret is None:
            raise Exception(f"No totp_secret found for url_slug: {request.url_slug}")

        if not totp_service.verify_totp(request.totp, totp_secret):
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail      = "Invalid TOTP!"
            )

        return {"upload_token": jwt_manager.create_upload_token(request.url_slug)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f"Database Error: {str(e)}"
        )