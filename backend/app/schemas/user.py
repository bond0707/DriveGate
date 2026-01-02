from typing import Optional
from app.core.enums import DriveType
from pydantic import BaseModel, EmailStr

# Request schema when google redirects from uri
class GoogleAuthRequest(BaseModel):
    code: str
    state: Optional[str] = None  # Optional parameter for security

class FolderUpdateRequest(BaseModel):
    folder_name: str
    drive_type: DriveType

class FolderUpdateResponse(BaseModel):
    folder_id: str
    folder_name: str

# Response Schema for user data going to Frontend
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    totp_secret: Optional[str] = None
    folder_id: Optional[str] = None
    folder_name: Optional[str] = None
    url_slug: Optional[str] = None

# Response schema for successful authentication
class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse
    token_type: str = "bearer"

# JWT payload data (@Dhruvil we are not using this anywhere. so delete it if unnecessary.)
class TokenData(BaseModel):
    email: str
    user_id: int