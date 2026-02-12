import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV_TYPE: str
    CORS_ORIGIN: str
    BACKEND_API_KEY: str

    DB_CA_CERT: str
    DATABASE_URL: str
    DB_FIELD_ENCRYPTION_KEY: str
 
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    GOOGLE_DRIVE_UPLOAD_REQUEST_URL: str

    APP_NAME: str
    APP_VERSION: str

    model_config = SettingsConfigDict(
        env_file = ".env",
        extra    = "ignore", # This allows extra fields in .env without errors
        env_file_encoding = "UTF-8",
    )

settings = Settings()