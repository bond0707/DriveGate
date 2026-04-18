from typing import Optional
from app.core.enums import DriveType
from pydantic import BaseModel, Field

class FileMetadataRequest(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=255)
    mime_type: str
    parent_folder_id: Optional[str] = None

class UploadURLResponse(BaseModel):
    upload_url: str

class CreateFolderRequest(BaseModel):
    folder_name: str
    parent_folder_id: Optional[str] = None

class CreateFolderResponse(BaseModel):
    folder_id: str

class UpdateFolderRequest(BaseModel):
    folder_name: str = Field(..., pattern=r"^[a-zA-Z0-9\s-]+$")
    drive_type: DriveType

class UpdateFolderResponse(BaseModel):
    folder_id: str
    folder_name: str