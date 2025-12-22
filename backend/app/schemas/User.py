from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Request schema when the google redirects form uri 

class GoogleAuthRequest(BaseModel):
    code: str
    state: Optional[str] = None # Optional parmameter for security


# Request Schema For datagoing to Frotend
class UserResponse(BaseModel):
    id: int
    google_uuid: str
    username: str
    email: EmailStr
    totp_secret: Optional[str] = None # Totp Secret Optional if set
    drive_folder_id: Optional[str] = None # if given to setup our drive steup niggaaa

    class Config:
        from_attributes =True # Allows conversion from SQLAlchemy model

# Response schema for successful authentication jyare login thai jaay pachi nu
class AuthResponse(BaseModel):
    access_token: str  
    token_type: str = "bearer"  
    user: UserResponse 


# JWT payload data 
class TokenData(BaseModel):
  
    user_id: int
    email: str