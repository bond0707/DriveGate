from pydantic import BaseModel, Field

class VerifyAndStoreTOTPRequest(BaseModel):
    user_totp: str = Field(..., pattern=r"^\d{6}$")
    user_totp_secret: str

class VerifyTOTPRequest(BaseModel):
    totp: str = Field(..., pattern=r"^\d{6}$")
    url_slug: str = Field(..., pattern=r"^[a-z0-9-]+$")

class TOTPSecretResponse(BaseModel):
    totp_secret: str
    provisioning_uri: str

class UploadTokenResponse(BaseModel):
    upload_token: str
