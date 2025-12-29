from typing import Optional
from app.database.connection import Base
from sqlalchemy import CHAR, String, Text
from sqlalchemy.orm import Mapped, mapped_column

class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True) 
    google_uuid: Mapped[str] = mapped_column(String(255), unique=True)
    username: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    google_refresh_token: Mapped[str] = mapped_column(Text)
    totp_secret: Mapped[Optional[str]] = mapped_column(CHAR(32), unique=True)
    drive_folder_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    upload_url: Mapped[Optional[str]] = mapped_column(String(50), unique=True)