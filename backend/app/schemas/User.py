from typing import Optional
from pydantic import BaseModel, EmailStr

# Request schema when google redirects form uri 
class GoogleAuthRequest(BaseModel):
    code: str
    state: Optional[str] = None # Optional parmameter for security

# Request Schema for data going to Frotend
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    google_uuid: str
    totp_secret: Optional[str] = None # Totp Secret Optional if set
    drive_folder_id: Optional[str] = None # if given to setup our drive steup niggaaa

    class Config:
        from_attributes = True # Allows conversion from SQLAlchemy model

# Response schema for successful authentication jyare login thai jaay pachi nu
class AuthResponse(BaseModel):
    access_token: str  
    user: UserResponse 
    token_type: str = "bearer"  

# JWT payload data 
class TokenData(BaseModel):
    email: str
    user_id: int