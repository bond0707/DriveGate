from app.core.enums import DriveType
from app.database.connection import Base
from app.database.enums import drive_type_enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    TEXT, 
    String, 
    BigInteger, 
    ForeignKey,
    PrimaryKeyConstraint,
    ForeignKeyConstraint
)

class UserDriveModel(Base):
    __tablename__ = "user_drive"

    user_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    drive_type: Mapped[DriveType] = mapped_column(
        drive_type_enum,
    )
    user_auth_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )
    totp_secret: Mapped[str] = mapped_column(
        TEXT,
        nullable=True
    )
    folder_id: Mapped[str] = mapped_column(
        String(255), 
        nullable=True
    )
    folder_name: Mapped[str] = mapped_column(
        String(255), 
        nullable=True
    )
    url_slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=True
    )

    __table_args__ = (
        # Primary Key ensuring that a user can have one drive per provider.
        PrimaryKeyConstraint("user_id", "drive_type", name="pk_user_drive"),
        # Composite foreign key ensuring the linked auth credential actually
        # belongs to the current user.
        ForeignKeyConstraint(
            ["user_auth_id", "user_id"],
            ["user_auth.id", "user_auth.user_id"],
            name = "fk_drive_auth_ownership_check",
            ondelete = "CASCADE"
        )
    )