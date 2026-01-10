from pydantic import BaseModel, Field

class URLSlugUpdateRequest(BaseModel):
    url_slug: str = Field(..., pattern=r"^[a-z0-9-]+$")

class UpdateURLSlugResponse(BaseModel):
    url_slug: str

class FileMetadataRequest(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0)
    mime_type: str

class UploadURLResponse(BaseModel):
    upload_url: str