import httpx
from fastapi import status
from typing import Optional
from app.core.config import settings
from googleapiclient.discovery import build
from fastapi.exceptions import HTTPException
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

class GoogleDriveService:
    DRIVE_API_VERSION = "v3"

    async def create_drive_folder(
        self, 
        folder_name: str, 
        access_token: str,
        parent_folder_id: Optional[str] = None, 
    ) -> str:
        try:
            # Create credentials object from access token
            credentials = Credentials(token = access_token)

            # Build google Drive Service Client
            drive_service = build(
                'drive',
                self.DRIVE_API_VERSION,
                credentials = credentials
            )

            # Set up metadata
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
            }
            if parent_folder_id is not None:
                folder_metadata["parents"] = [parent_folder_id]

            # Create folder
            folder = drive_service.files().create(
                body   = folder_metadata,
                fields = 'id'  # Only return the folder ID
            ).execute()

            return folder.get('id')

        except HttpError as e:
            raise Exception(f'Google Drive API Error : {e}')
        except Exception as er:
            raise Exception(f'Failed to Create Drive Folder : {er}')
 
    async def initiate_file_upload(
        self,
        file_name: str,
        mime_type: str,
        parent_folder_id: str,
        google_access_token: str,
    ) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {google_access_token}",
            "Content-Type": "application/json",
            "X-Upload-Content-Type": mime_type,
            # CRITICAL: Origin header required for Google to allow CORS on the PUT request from browser
            "Origin": settings.CORS_ORIGIN
        }

        body = {
            "name": file_name,
            "parents": [parent_folder_id],
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

        return upload_url

google_drive_service = GoogleDriveService()