import pyotp
from pydantic import EmailStr
from app.core.config import settings

class TOTPService:
    def __init__(self):
        pass

    def generate_totp_secret(self):
        return pyotp.random_base32()

    def verify_totp(
        self, 
        totp: str, 
        totp_secret: str,
    ) -> bool:
        return pyotp.TOTP(totp_secret).verify(totp)

    def get_provisioning_uri(
        self,
        email: EmailStr,
        totp_secret: str
    ):
        totp_obj = pyotp.TOTP(totp_secret)
        uri = totp_obj.provisioning_uri(
            name = email,
            image = settings.APP_LOGO, #https://www.qr-code-generator.com/
            issuer_name = settings.APP_NAME
        )
        return uri

totp_service = TOTPService()