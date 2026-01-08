from typing import Optional, Tuple
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import UserModel
from app.core.enums import AuthType, DriveType
from app.models.user_auth import UserAuthModel
from app.models.user_drive import UserDriveModel


class UserService:
    async def get_user_by_id(
        self,
        db: AsyncSession,
        user_id: int
    ) -> Optional[UserModel]:
        """Gets a user using ID."""
        try:
            # Faster lookups for primary keys (cache-based)
            return await db.get(UserModel, user_id)
        except Exception as e:
            raise Exception(f"Failed to get the user by ID : {e}")

    async def get_user_by_email(
        self,
        db: AsyncSession,
        email: str,
    ) -> Optional[UserModel]:
        """Gets a user using E-mail."""
        try:
            query = select(UserModel).where(UserModel.email == email)
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise Exception(f"Failed to get the user by E-mail : {e}")

    async def get_user_drive(
        self,
        db: AsyncSession,
        user_id: int,
        drive_type: DriveType 
    ) -> Optional[UserDriveModel]:
        """Gets user drive configuration."""
        try:
            query = (
                select(UserDriveModel)
                .where(UserDriveModel.user_id == user_id)
                .where(UserDriveModel.drive_type == drive_type.value)
            )
            result = await db.execute(query)

            user_drive = result.scalar_one_or_none()
            return user_drive
        except Exception as e:
            raise Exception(f"Failed to get user drive : {e}")

    async def get_totp_secret_by_url_slug(
        self,
        db: AsyncSession,
        url_slug: str,
    ) -> Optional[str]:
        """Gets TOTP Secret of a user from their url slug."""
        try:
            query = (
                select(UserDriveModel.totp_secret)
                .where(UserDriveModel.url_slug == url_slug)
            )

            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise Exception(f"Failed to get TOTP Secret : {e}")
    
    async def get_auth_secret_by_user_id_drive_type(
        self,
        db: AsyncSession,
        user_id: int,
        drive_type: DriveType
    ):
        try:
            query = (
                select(UserAuthModel.auth_secret)
                .join(UserDriveModel, UserAuthModel.id == UserDriveModel.user_auth_id)
                .where(UserAuthModel.user_id == user_id)
                .where(UserDriveModel.drive_type == drive_type.value)
            )
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise Exception(f"Failed to get Auth Secret : {e}")

    async def get_drive_credentials_by_url_slug(
        self,
        db: AsyncSession,
        url_slug: str,
    ) -> Optional[Tuple[str, str]]:
        """Gets drive folder id and refresh token of a user from their url slug."""
        try:
            query = (
                select(UserDriveModel.folder_id, UserAuthModel.auth_secret)
                .join(
                    UserAuthModel, 
                    UserDriveModel.user_auth_id == UserAuthModel.id
                )
                .where(UserDriveModel.url_slug == url_slug)
            )
            result = await db.execute(query)
            row = result.one_or_none()

            if row is None:
                return None
            return (row.folder_id, row.auth_secret)
        except Exception as e:
            raise Exception(f"Failed to get Drive Credentials: {e}")

    async def create_user(
        self,
        db: AsyncSession,
        user_data: dict
    ) -> UserModel:
        """Creates a user (insertion in DB)."""
        try:
            user = UserModel(**user_data)
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError as e:
            await db.rollback()
            if "email" in str(e):
                raise Exception("User with this email already exists")
            else:
                raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            await db.rollback()
            raise Exception(f"Unknown exception occurred: {str(e)}")

    async def create_user_auth(
        self,
        db: AsyncSession,
        user_id: int,
        provider_user_id: str,
        secret_token: str,
        auth_type: AuthType
    ) -> UserAuthModel:
        """Creates a user auth entry (OAuth credentials)."""
        try:
            user_auth = UserAuthModel(
                user_id          = user_id,
                auth_type        = auth_type.value,
                auth_secret      = secret_token,
                provider_user_id = provider_user_id,
            )
            db.add(user_auth)
            await db.commit()
            await db.refresh(user_auth)
            return user_auth
        except IntegrityError as e: # BETTER EXCEPTION HANDLING NEEDED
            await db.rollback()
            if "provider_user_id" in str(e):
                raise Exception("User with this provider ID already exists")
            else:
                raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to create user auth: {str(e)}")

    async def create_user_drive(
        self,
        db: AsyncSession,
        user_id: int,
        drive_type: DriveType,
        user_auth_id: int,
        totp_secret: str,
        folder_id: str,
        folder_name: str,
        url_slug: str,
    ) -> UserDriveModel:
        """Creates a user drive entry."""
        try:
            user_drive = UserDriveModel(
                user_id      = user_id,
                drive_type   = drive_type.value,
                user_auth_id = user_auth_id,
                totp_secret  = totp_secret,
                folder_id    = folder_id,
                folder_name  = folder_name,
                url_slug     = url_slug
            )
            db.add(user_drive)
            await db.commit()
            await db.refresh(user_drive)
            return user_drive
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to create user drive: {str(e)}")

    async def update_refresh_token(
        self,
        db: AsyncSession,
        user_id: int,
        auth_type: AuthType,
        refresh_token: str,
    ) -> Optional[UserAuthModel]:
        """Update the refresh token (secret_token) of the user."""
        try:
            query = (
                update(UserAuthModel)
                .where(UserAuthModel.user_id == user_id)
                .where(UserAuthModel.auth_type == auth_type.value)
                .values(auth_secret = refresh_token)
                .returning(UserAuthModel)
            )
            result = await db.execute(query)
            user_auth = result.scalar_one_or_none()
            await db.commit()
            return user_auth
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"Failed to update refresh token: {e}")

    async def update_totp_secret(
        self,
        db: AsyncSession,
        user_id: int,
        totp_secret: str,
        drive_type: DriveType
    ) -> Optional[UserDriveModel]:
        """Update a user's TOTP secret."""
        try:
            query = (
                update(UserDriveModel)
                .where(UserDriveModel.user_id == user_id)
                .where(UserDriveModel.drive_type == drive_type.value)
                .values(totp_secret=totp_secret)
                .returning(UserDriveModel)
            )
            result = await db.execute(query)
            user_drive = result.scalar_one_or_none()
            await db.commit()
            return user_drive
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"TOTP Secret needs to be unique! Error: {e}")
    
    async def update_drive_folder_id_and_name(
        self,
        db: AsyncSession,
        user_id: int,
        drive_type: DriveType,
        folder_id: str,
        folder_name: str,
    ):
        try:
            query = (
                update(UserDriveModel)
                .where(UserDriveModel.user_id == user_id)
                .where(UserDriveModel.drive_type == drive_type.value)
                .values(folder_id = folder_id, folder_name = folder_name)
                .returning(UserDriveModel)
            )
            result = await db.execute(query)
            user_drive = result.scalar_one_or_none()
            await db.commit()
            return user_drive
        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to update folder_id and folder_name for user_id : {user_id} and drive_type : {drive_type.value}")

    async def update_url_slug(
        self,
        db: AsyncSession,
        user_id: int,
        url_slug: str,
        drive_type: DriveType
    ) -> Optional[UserDriveModel]:
        """Update a user's URL slug."""
        try:
            query = (
                update(UserDriveModel)
                .where(UserDriveModel.user_id == user_id)
                .where(UserDriveModel.drive_type == drive_type.value)
                .values(url_slug = url_slug)
                .returning(UserDriveModel)
            )
            result = await db.execute(query)
            user_drive = result.scalar_one_or_none()
            await db.commit()
            return user_drive
        except IntegrityError as e:
            await db.rollback()
            raise e

    async def check_url_slug_exists(
        self,
        db: AsyncSession,
        url_slug: str,
    ) -> bool:
        """Checks if a URL slug already exists."""
        try:
            query = select(UserDriveModel.id).where(UserDriveModel.url_slug == url_slug)
            result = await db.execute(query)
            return result.first() is not None
        except Exception as e:
            raise Exception(f"Failed to check slug availability: {e}")
    
    async def delete_user(db: AsyncSession, user_id: int) -> Optional[UserModel]:
        try:
            query = (
                delete(UserModel)
                .where(UserModel.id == user_id)
                .returning(UserModel)
            )
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            await db.commit()
            return user
        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to delete user with id : {user_id}")


user_service = UserService()