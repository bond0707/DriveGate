from typing import Optional, Tuple
from sqlalchemy.exc import IntegrityError
from app.models.UserModel import UserModel
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:
    async def get_user_by_id(
        self,
        db: AsyncSession,
        user_id: int
    ) -> Optional[UserModel]:
        
        """Gets a user using ID."""

        try:
            # Faster cache-based lookups (only works for primary keys)
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

    async def get_totp_secret_by_url_slug(
        self, 
        db: AsyncSession,
        url_slug: str, 
    ) -> Optional[str]:

        """Gets TOTP Secret of a user from their url slug"""

        try:
            query = select(UserModel.totp_secret).where(UserModel.upload_url == url_slug)
            result = await db.execute(query)
            result = result.scalar_one_or_none()

            if result is None:
                return None
            else:
                return result
        except Exception as e:
            raise Exception(f"Failed to get TOTP Secret: {e}")
    
    async def get_drive_credentials_by_url_slug(
        self, 
        db: AsyncSession,
        url_slug: str, 
    ) -> Optional[Tuple]:

        """Gets drive folder id and refresh token of a user from their url slug"""

        try:
            query = (
                select(UserModel.drive_folder_id, UserModel.google_refresh_token)
                .where(UserModel.upload_url == url_slug)
            )
            result = await db.execute(query)
            row = result.one_or_none()

            if row is None:
                return None
            else:
                return (row.drive_folder_id, row.google_refresh_token)
        except Exception as e:
            raise Exception(f"Failed to get Drive Folder ID : {e}")

    async def create_user(
        self, 
        db: AsyncSession, 
        user_data: dict
    ) -> UserModel:
        
        """Creates a user (insertion in DB).(This requires security checks later!!!!)"""

        try:
            user = UserModel(**user_data)
            db.add(user)
            await db.commit()
            await db.refresh(user) # Get auto-generated Id
            return user
        except IntegrityError as e:
            await db.rollback()
            if "google_uuid" in str(e):
                raise Exception("User with this Google ID already exists")
            elif "email" in str(e):
                raise Exception("User with this email already exists")
            else:
                raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            await db.rollback()
            raise Exception(f"Unknown exception occured : {str(e)}")

    async def update_refresh_token(
        self,
        db: AsyncSession,
        user_id: int,
        refresh_token: str
    ) -> UserModel:
        
        """Update the refresh token of the user."""

        try:
            query = (
                update(UserModel)
                .where(UserModel.id == user_id)
                .values(google_refresh_token = refresh_token)
                .returning(UserModel)
            )
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            await db.commit()

            if user is None:
                raise Exception(f"No user found with the id : {user_id}")

            return user
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"Account Refresh Token needs to be unique! Error: {e}")

    async def update_drive_folder(
        self,
        db: AsyncSession,
        user_id: int, 
        folder_id: str
    ) -> UserModel:

        """Update a user's google drive folder id"""

        try:  
            query = (
                update(UserModel)
                .where(UserModel.id == user_id)
                .values(drive_folder_id = folder_id)
                .returning(UserModel)
            )
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            await db.commit()

            if user is None:
                raise Exception(f"No user found with the id : {user_id}")

            return user
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"Google Drive Folder ID needs to be unique! Error: {e}")

    async def update_totp_secret(
        self, 
        db: AsyncSession,
        user_id: int, 
        totp_secret: str
    ) -> UserModel:

        """Update a user's TOTP secret"""

        try:
            query = (
                update(UserModel)
                .where(UserModel.id == user_id)
                .values(totp_secret = totp_secret)
                .returning(UserModel)
            )
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            await db.commit()

            if user is None:
                raise Exception(f"No user found with the id : {user_id}")

            return user
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"TOTP Secret needs to be unique! Error: {e}")

    async def update_url_slug(
        self, 
        db: AsyncSession,
        user_id: int, 
        url_slug: str
    ) -> UserModel:

        """Update a user's URL slug"""

        try:
            query = (
                update(UserModel)
                .where(UserModel.id == user_id)
                .values(upload_url = url_slug)
                .returning(UserModel)
            )
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            await db.commit()

            if user is None:
                raise Exception(f"No user found with the id : {user_id}")

            return user
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"URL Slug needs to be unique! Error: {e}")

    async def delete_user(
        self, 
        db: AsyncSession,
        user_id: int
    ) -> Tuple[int, str, str]:

        """Deletes a user from the db. (need to add 'delete account' in frontend)"""
    
        try:
            query = (
                delete(UserModel)
                .where(UserModel.id == user_id)
                .returning(UserModel.id, UserModel.username, UserModel.email)
            )
            result = await db.execute(query)
            user = result.one_or_none()
            await db.commit()

            if user is None:
                raise Exception(f"No user found with the id : {user_id}")

            return (user.id, user.username, user.email)

        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to delete user : {e}")

user_service = UserService()