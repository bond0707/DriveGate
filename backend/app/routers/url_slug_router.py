from app.core.enums import DriveType
from app.models.users import UserModel
from sqlalchemy.exc import IntegrityError
from app.database.connection import get_db
from fastapi.exceptions import HTTPException
from fastapi import APIRouter, status, Depends 
from app.schemas.generic import MessageResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user
from app.schemas.url_slug import (
    ValidateURLSlugRequest,
    UpdateURLSlugRequest, 
    UpdateURLSlugResponse,
    CheckURLSlugAvailabilityRequest,
    CheckURLSlugAvailabilityResponse
)

url_slug_router = APIRouter()

@url_slug_router.post("/slug/validate", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def validate_url_slug(
    request: ValidateURLSlugRequest,
    db: AsyncSession = Depends(get_db)
):
    if await user_service.get_totp_secret_by_url_slug(db, request.url_slug) is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail      = "Url slug is invalid, redirect to marketing page (to-do)!"
        )
    else:
        return {"message": "Url slug is valid!"}

@url_slug_router.patch("/slug", response_model=UpdateURLSlugResponse, status_code=status.HTTP_200_OK)
async def update_url_slug(
    request: UpdateURLSlugRequest,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_drive = await user_service.update_url_slug(
            db         = db,
            user_id    = user.id,
            url_slug   = request.url_slug,
            drive_type = DriveType.GOOGLE_DRIVE
        )
        if user_drive is None:
            raise Exception(f"No user drive found for user_id : {user.id} and drive_type : {DriveType.GOOGLE_DRIVE}")

        return {"url_slug": user_drive.url_slug}
    except IntegrityError as e:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail      = "This url slug is already taken."
        )
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = str(e)
        )

@url_slug_router.post("/slug/check-availability", response_model=CheckURLSlugAvailabilityResponse, status_code=status.HTTP_200_OK)
async def check_slug_availability(
    request: CheckURLSlugAvailabilityRequest,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user)
):
    try:
        exists = await user_service.check_url_slug_exists(db, request.url_slug)
        return {"available": not exists}
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = str(e)
        )