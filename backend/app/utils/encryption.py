from app.core.config import settings
from cryptography.fernet import Fernet, InvalidToken

class EncryptionUtil:
    def __init__(self, key: str):
        self.cipher = Fernet(key.encode())

    def encrypt(self, plaintext: str) -> str:
        return self.cipher.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        return self.cipher.decrypt(ciphertext.encode()).decode()

    # using this as some of the exsisting data is not encrypted yet will remove when we restart all the db entries
    def safe_decrypt(self, data: str) -> str:
        try:
            return self.cipher.decrypt(data.encode()).decode()
        except InvalidToken:
            # Data is not encrypted (legacy), return as-is
            return data

# Singleton instance (@Dhruvil, I can still create instances of this class, I'll implement it properly later. Or you can do it too.)
encryption_util = EncryptionUtil(settings.DB_FIELD_ENCRYPTION_KEY)
