import httpx
from app.schemas.drive import *
from app.core.config import settings
from app.core.enums import DriveType
from app.models.users import UserModel
from sqlalchemy.exc import IntegrityError
from app.database.connection import get_db
from fastapi.exceptions import HTTPException
from fastapi import APIRouter, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user_service import user_service
from app.services.google_auth_service import google_auth_service
from app.utils.dependencies import get_current_user, get_upload_token_payload

url_slug_router = APIRouter()

@url_slug_router.patch("/update", response_model=UpdateURLSlugResponse, status_code=status.HTTP_200_OK)
async def update_url_slug(
    request: URLSlugUpdateRequest,
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
# biz
@url_slug_router.get("/check-availability", status_code=status.HTTP_200_OK)
async def check_slug_availability(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user)
):
    try:
        exists = await user_service.check_url_slug_exists(db, slug)
        return {"available": not exists}
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = str(e)
        )

@url_slug_router.post("/get-upload-link", response_model=UploadURLResponse, status_code=status.HTTP_200_OK)
async def get_upload_uri(
    file_metadata: FileMetadataRequest,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(get_upload_token_payload)
):
    url_slug = payload.get("url_slug")

    if not url_slug:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Invalid token payload"
        )

    credentials = await user_service.get_drive_credentials_by_url_slug(db, url_slug)

    if credentials is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail      = "Drive credentials not found for this URL slug!"
        )

    folder_id, refresh_token = credentials

    if not folder_id:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail      = "Drive Folder ID not found!"
        )

    if not refresh_token:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail      = "Google Refresh Token not found!"
        )

    google_access_token = await google_auth_service.get_access_token(refresh_token)

    headers = {
        "Authorization": f"Bearer {google_access_token}",
        "Content-Type": "application/json",
        "X-Upload-Content-Type": file_metadata.mime_type,
        "X-Upload-Content-Length": str(file_metadata.file_size),
        # CRITICAL: Origin header required for Google to allow CORS on the PUT request from browser
        "Origin": "http://localhost:3000" 
    }

    body = {
        "name": file_metadata.file_name,
        "parents": [folder_id],
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url     = settings.GOOGLE_DRIVE_UPLOAD_REQUEST_URL,
            headers = headers,
            json    = body
        )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = "Failed to initiate upload with google!"
        )

    upload_url = response.headers.get("Location")

    if upload_url is None:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = "Google did not return a upload URL!"
        )

    return {"upload_url": upload_url}