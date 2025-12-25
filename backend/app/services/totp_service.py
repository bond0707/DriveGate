import pyotp

class TOTPService():
    def __init__(self):
        pass

    async def generate_client_secret(self):
        return pyotp.random_base32()

    async def verify_totp(
        self, 
        totp: str, 
        totp_secret: str,
    ) -> bool:
        return pyotp.TOTP(totp_secret).verify(totp, valid_window=1)

totp_service = TOTPService()