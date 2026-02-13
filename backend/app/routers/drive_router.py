from app.models.users import UserModel
from app.database.connection import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user_service import user_service
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.google_auth_service import google_auth_service
from app.services.google_drive_service import google_drive_service
from app.utils.dependencies import get_current_user, get_upload_token_payload
from app.schemas.drive import (
    UploadURLResponse,
    FileMetadataRequest,
    CreateFolderRequest,
    UpdateFolderRequest,
    CreateFolderResponse,
    UpdateFolderResponse,
)

drive_router = APIRouter()

# This method will only be used to create folder/subfolder when uploading. 
# It expects an access token to be passed to it.
@drive_router.post("/folder", response_model=CreateFolderResponse, status_code=status.HTTP_200_OK)
async def create_drive_folder(
    request: CreateFolderRequest,
    payload: dict = Depends(get_upload_token_payload)
):
    try:
        google_access_token = payload.get("google_access_token")

        if not google_access_token:
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail      = "Missing access token in payload"
            )

        folder_id = await google_drive_service.create_drive_folder(
            folder_name      = request.folder_name,
            access_token     = google_access_token,
            parent_folder_id = request.parent_folder_id,   
        )

        return {"folder_id": folder_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = str(e)
        )

# This method will be used in signup process and "/setup-folder" page, not the upload page. 
# That's why it has logic to get access token externally.
@drive_router.patch("/folder", response_model=UpdateFolderResponse, status_code=status.HTTP_200_OK)
async def update_drive_folder(
    request: UpdateFolderRequest,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
):
    try:
        auth_secret = await user_service.get_auth_secret_by_user_id_drive_type(
            db         = db,
            user_id    = user.id,
            drive_type = request.drive_type
        )
        if auth_secret is None:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail      = "Could not find auth secret for the current user!"
            )
        access_token = await google_auth_service.get_access_token(auth_secret)
        folder_id = await google_drive_service.create_drive_folder(
            request.folder_name,
            access_token
        )
        user_drive = await user_service.update_drive_folder_id_and_name(
            db          = db,
            user_id     = user.id,
            drive_type  = request.drive_type,
            folder_id   = folder_id,
            folder_name = request.folder_name
        )
        if user_drive is None:
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail      = "Could not update folder_id and folder_name for the current user in db!"
            )

        return {
            "folder_id": folder_id, 
            "folder_name": request.folder_name
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f"Could not create folder in drive : {str(e)}"
        )

@drive_router.post("/upload-link", response_model=UploadURLResponse, status_code=status.HTTP_200_OK)
async def get_upload_uri(
    file_metadata: FileMetadataRequest,
    payload: dict = Depends(get_upload_token_payload)
):
    url_slug = payload.get("url_slug")
    folder_id = payload.get("folder_id")
    google_access_token = payload.get("google_access_token")

    if not url_slug:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Invalid token payload"
        )

    if not google_access_token:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Missing access token in payload"
        )

    if not folder_id:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Missing folder ID in payload"
        )

    upload_url = await google_drive_service.initiate_file_upload(
        file_name = file_metadata.file_name,
        mime_type = file_metadata.mime_type,
        parent_folder_id = file_metadata.parent_folder_id or folder_id,
        google_access_token = google_access_token
    )

    if upload_url is None:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = "Google did not return a upload URL!"
        )

    return {"upload_url": upload_url}