from pydantic import BaseModel

class URLSlugUpdateRequest(BaseModel):
    url_slug: str

class UpdateURLSlugResponse(BaseModel):
    url_slug: str

class FileMetadataRequest(BaseModel):
    file_name: str
    file_size: int
    mime_type: str
    md5_checksum: str

class UploadURLResponse(BaseModel):
    upload_url: str