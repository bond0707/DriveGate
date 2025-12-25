from typing import Optional
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.models.UserModel import UserModel
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:

    async def get_user_by_id(
        self,
        db: AsyncSession,
        user_id: int
    ) -> Optional[UserModel]:
        
        """Gets a user using ID."""

        query = select(UserModel).where(UserModel.id == user_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_by_email(
        self,
        db: AsyncSession,
        email: str, 
    ) -> Optional[UserModel]:
        
        """Gets a user using E-mail."""

        query = select(UserModel).where(UserModel.email == email)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_totp_secret_by_url_slug(
        self, 
        db: AsyncSession,
        url_slug: str, 
    ) -> Optional[str]:

        """Gets TOTP Secret of a user from their url slug"""

        try:
            query = select(UserModel).where(UserModel.upload_url == url_slug)
            result = await db.execute(query)
            result = result.scalar_one_or_none()

            if result is None:
                return None
            else:
                print(result)
                return result.totp_secret  
        except Exception as e:
            raise Exception(f"Failed to get TOTP Secret: {e}")

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

    async def update_refresh_token(
        self,
        db: AsyncSession,
        user_id: UserModel,
        refresh_token: str
    ) -> UserModel:
        
        """Update the refresh token of the user."""

        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise Exception('User Not Found')

        try:
            user.google_refresh_token = refresh_token
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError as e:
            raise Exception(f"Account Refresh Token needs to be unique! Error: {e}")

    async def update_drive_folder(
        self,
        db: AsyncSession,
        user_id: int, 
        folder_id: str
    ) -> UserModel:

        """Update a user's google drive folder id"""

        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise Exception('User Not Found')

        try:        
            user.drive_folder_id = folder_id
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError as e:
            raise Exception(f"Google Drive Folder ID needs to be unique! Error: {e}")

    async def update_totp_secret(
        self, 
        db: AsyncSession,
        user_id: int, 
        totp_secret: str
    ) -> UserModel:

        """Update a user's TOTP secret"""

        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise Exception('User not found')
        
        try:
            user.totp_secret = totp_secret
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError as e:
            raise Exception(f"TOTP Secret needs to be unique! Error: {e}")

    async def update_url_slug(
        self, 
        db: AsyncSession,
        user_id: int, 
        url_slug: str
    ) -> UserModel:

        """Update a user's URL slug"""

        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise Exception('User not found')
        
        try:
            user.upload_url = url_slug
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError as e:
            raise Exception(f"URL Slug needs to be unique! Error: {e}")

    async def delete_user(
        self, 
        db: AsyncSession,
        user_id: int
    ) -> bool:
        
        """Deletes a user from the db. (need to add 'delete account' in frontend)"""

        user = await self.get_user_by_id(db, user_id)
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True

user_service = UserService()
