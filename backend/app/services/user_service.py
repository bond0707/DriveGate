from typing import Optional
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.models.UserModel import UserModel
from sqlalchemy.ext.asyncio import AsyncSession

class UserService():
    # getting user by id (!!!!!!!!!!!!!!! USED AI HELP FOR THIS SETUP !!!!!!!!!!) CHECK IT FOR ME (works)
    # but I learnt that services use the dependency injection and not the routes so 
    # for this we will keep it as it is (or i will change it in the future)
    # basically routing methods should not have access to db as they never use it, just pass it to services
    # but ama em j che atle atyar mate change nathi karto.

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> Optional[UserModel]:
        query = select(UserModel).where(UserModel.id == user_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    # By our email
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[UserModel]:
        query = select(UserModel).where(UserModel.email ==  email)
        results = await db.execute(query)
        return results.scalar_one_or_none()
    
    # For TOTP page
    async def get_totp_secret_by_url_slug(self, url_slug: str, db: AsyncSession) -> Optional[str]:
        try:
            query = select(UserModel).where(UserModel.upload_url == url_slug)
            result = await db.execute(query)
            result = result.scalar_one_or_none()

            if result is None:
                return None
            else:
                return result['totp_secret']    
        except Exception as e:
            raise Exception(f"Failed to get TOTP Secret: {e}")

    # Creating a User
    async def create_user(self, db: AsyncSession, user_data: dict) -> UserModel:
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
    
    # Update Operations
    async def update_user(self, db: AsyncSession, user: UserModel, update_data: dict) -> UserModel:
        try:
            for key, value in update_data.items():
                if hasattr(user, key): # was fucking up in this setup this methods were adivced by ai please check it for me nigga (@Dhruvil, it's the best. All in one. AI cooked.)
                    setattr(user, key, value)
                await db.commit()
                await db.refresh(user)
                return user
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"Update failed: {str(e)}")
    
    # Delete a user (@Dhruvil, we dont need this atleast for MVP but we'll keep it as account deletion functionality is essential.)
    async def delete_user(self, db: AsyncSession, user_id: int) -> bool:
        user = await self.get_user_by_id(db, user_id)
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True

## For Dhruvil:
## Can't we just use "update_user()" everywhere???
## I will remove them in the next commit unless they're required.
## Why are "update_drive_folder()" and "update_totp_secret()" required?
## UPDATE: I removed them.

user_service = UserService()


        

    
