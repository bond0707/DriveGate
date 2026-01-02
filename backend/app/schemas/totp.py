from pydantic import BaseModel

class VerifyAndStoreTOTPRequest(BaseModel):
    user_totp: str
    user_totp_secret: str

class VerifyTOTPRequest(BaseModel):
    totp: str
    url_slug: str

class TOTPSecretResponse(BaseModel):
    totp_secret: str
    provisioning_uri: str

class UploadTokenResponse(BaseModel):
    upload_token: str
