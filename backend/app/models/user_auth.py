from app.core.enums import AuthType
from app.database.connection import Base
from app.database.enums import auth_type_enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    Text, 
    ForeignKey, 
    BigInteger,
    UniqueConstraint, 
)

class UserAuthModel(Base):
    __tablename__ = "user_auth"

    id: Mapped[int] = mapped_column(
        BigInteger, 
        primary_key=True,
        autoincrement=True, 
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    auth_type: Mapped[AuthType] = mapped_column(
        auth_type_enum,
        nullable=False
    )
    provider_user_id: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    auth_secret: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    __table_args__ = (
        # A security index enabling other tables to verify 
        # that a specific auth ID belongs to a specific user.
        UniqueConstraint("id", "user_id", name="uq_auth_id_user_id"),
        # A user can only have one set of credentials per provider.
        UniqueConstraint("user_id", "auth_type", name="uq_user_id_auth_type"),
        # A user id given by the auth provider should never occur again 
        # for that provider.
        UniqueConstraint("auth_type", "provider_user_id", name="uq_auth_provider_user"),
    )