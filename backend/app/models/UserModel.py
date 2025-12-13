from app.database.connection import Base
from sqlalchemy import Column, String, Text, Integer

class UserModel(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    google_uuid = Column(String(255), unique=True, nullable=False)
    username = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    google_refresh_token = Column(Text, nullable=False)
    totp_secret = Column(String(32), unique=True, nullable=True)
    drive_folder_id = Column(String(255), unique=True, nullable=True)
    upload_url = Column(String(50), unique=True, nullable=True)
