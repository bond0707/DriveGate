from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# Request schema when google redirects from uri
class GoogleAuthRequest(BaseModel):
    code: str
    state: Optional[str] = None  # Optional parameter for security

# Response Schema for user data going to Frontend
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    picture_url: Optional[str] = None
    totp_secret: Optional[str] = None
    folder_id: Optional[str] = None
    folder_name: Optional[str] = Field(None, pattern=r"^[a-zA-Z0-9\s-]+$")
    url_slug: Optional[str] = Field(None, pattern=r"^[a-z0-9-]+$")

class DeleteUserResponse(BaseModel):
    username: str

# Response schema for successful authentication
class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse
    token_type: str = "bearer"

# JWT payload data (@Dhruvil we are not using this anywhere. so delete it if unnecessary.)
class TokenData(BaseModel):
    email: str
    user_id: int