from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

# Our model
from app.models.UserModel import UserModel


class UserService:
    # getting user by id (!!!!!!!!!!!!!!! USED AI HELP FOR THIS SETUP !!!!!!!!!!) CHECK IT FOR ME
    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> Optional[UserModel]:
        result = await db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        return result.scalar_one_or_none()
    
    # By our email
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[UserModel]:
        results = await db.execute(
            select(UserModel).where(UserModel.email ==  email)
        )
        return results.scalar_one_or_none()
    
    # Creating a User
    async def create_user(self, db: AsyncSession, user_data: dict) -> UserModel:
        try:
            user = UserModel(**user_data)
            db.add(user)
            await db.commit()
            await db.refresh(user) # Get aut-generated Id
            return user
        
        except IntegrityError as e:
            await db.rollback()
            if "google_uuid" in str(e):
                raise Exception("User with this Google ID already exists")
            elif "email" in str(e):
                raise Exception("User with this email already exists")
            else:
                raise Exception(f"Database error: {str(e)}")
    
    # Updating a user
    async def update_user(self, db: AsyncSession, user: UserModel, update_data: dict) -> UserModel:
        try:
            for key, value in update_data.items():
                if hasattr(user, key): # was fucking up in this setup this methods were adivced by ai please check it for me nigga
                    setattr(user, key, value)
                
                await db.commit()
                await db.refresh(user)
                return user
        except IntegrityError as e:
            await db.rollback()
            raise Exception(f"Update failed: {str(e)}")
        
    # Updating Goog_dirve folder id
    async def update_drive_folder(self, db: AsyncSession, user_id: int, folder_id: str) -> UserModel:
        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise Exception('User Not Found')
        
        user.drive_folder_id = folder_id

        await db.commit()
        await db.refresh(user)
        return user
    

    # Update TOTP secret
    async def update_totp_secret(self, db: AsyncSession, user_id: int, totp_secret: str) -> UserModel:

        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise Exception('User not found')
        
        user.totp_secret = totp_secret

        await db.commit()
        await db.refresh(user)
        return user
    
    # Delete a user
    async def delete_user(self, db: AsyncSession, user_id: int) -> bool:
        user = await self.get_user_by_id(db, user_id)
        if not user:
            
            return False
        
        await db.delete(user)
        await db.commit()
        return True
    

user_service = UserService()


        

    
