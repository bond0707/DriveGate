from app.models.users import UserModel
from app.database.connection import get_db
from app.utils.jwt_manager import jwt_manager
from app.core.enums import AuthType, DriveType
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.encryption import encryption_util
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.google_auth_service import google_auth_service
from app.schemas.user import (
    AuthResponse, 
    UserResponse, 
    GoogleAuthRequest, 
    DeleteUserResponse,
)

auth_router = APIRouter()

@auth_router.get('/google/login', status_code=status.HTTP_200_OK)
async def google_login(force_consent: bool):
    try:
        auth_url = google_auth_service.get_authorization_url(force_consent)
        return {'auth_url': auth_url}
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f"Failed to generate login URL: {str(e)}"
        )

@auth_router.post('/google/callback', response_model=AuthResponse)
async def google_callback(
    auth_data: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Exchange authorization code for Google tokens
        tokens = await google_auth_service.exchange_code_for_tokens(auth_data.code)

        access_token  = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')

        if not access_token:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail      = 'Failed to get access token from google'
            )

        # Verify Scopes - Check if user granted Drive permissions
        scope = tokens.get('scope', '')
        if "https://www.googleapis.com/auth/drive.file" not in scope:
             raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail      = 'Google Drive permission is required. Please sign in again and check the Drive permissions box.'
            )

        # Get user info from AccessToken
        user_info = await google_auth_service.get_user_info(access_token)

        # Extract fields from user_info
        email = user_info.get('email')
        google_uuid = user_info.get('sub')
        picture_url = user_info.get('picture')
        username = user_info.get('name', email.split('@')[0])

        if not google_uuid or not email:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail      = "Invalid user info from Google"
            )

        # Check if the user exists
        user = await user_service.get_user_by_email(db, email)

        # If no refresh_token and user doesn't exist, they need to consent
        if not refresh_token and user is None: # New user clicked on "sign in" option.
            raise HTTPException(
                status_code = status.HTTP_409_CONFLICT,
                detail      = "Consent Required for this user."
            )

        if user is None:
            # Create user in UserModel
            user_data = {
                'email'       : email,
                'username'    : username,
                'picture_url' : picture_url
            }
            try:
                user = await user_service.create_user(db, user_data)
                user_auth = await user_service.create_user_auth(
                    db               = db,
                    user_id          = user.id,
                    provider_user_id = google_uuid,
                    secret_token     = refresh_token,
                    auth_type        = AuthType.GOOGLE,
                )
                await user_service.create_user_drive(
                    db           = db,
                    user_id      = user.id,
                    drive_type   = DriveType.GOOGLE_DRIVE,
                    user_auth_id = user_auth.id,
                    totp_secret  = None,
                    folder_id    = None,
                    folder_name  = None,
                    url_slug     = None,
                )
            except Exception as fe:
                deleted = await user_service.delete_user(db, user.id)
                if deleted is None:
                    print(f"CRITICAL: user entry created in db with id : {user.id}! Delete manually!") # NEED BETTER APPROACH HERE
                print(f"Warning: Failed to create user and link google drive: {fe}")
        else:
            # Existing user - update refresh token if we got a new one
            user = await user_service.update_picture_url(db, user.id, picture_url)
            if refresh_token:
                user_auth = await user_service.update_refresh_token(
                    db            = db,
                    user_id       = user.id, 
                    auth_type     = AuthType.GOOGLE,
                    refresh_token = refresh_token,
                )

                if user_auth is None:
                    raise Exception(f"No user auth found for user_id: {user.id} and auth_type: {AuthType.GOOGLE}")

        # Generate our JWT token
        jwt_token = jwt_manager.create_user_token(user.id, user.email)

        # Prepare response - get additional info for user response
        user_drive = await user_service.get_user_drive(db, user.id, DriveType.GOOGLE_DRIVE)

        if user_drive is None:
            raise Exception(f"There is no user_drive entry with user_id : {user.id} and drive_type : {DriveType.GOOGLE_DRIVE}")

        user_response = UserResponse(
            id          = user.id,
            username    = user.username,
            email       = user.email,
            picture_url = user.picture_url,
            totp_secret = encryption_util.safe_decrypt(user_drive.totp_secret) if user_drive.totp_secret else None,
            folder_id   = user_drive.folder_id,
            folder_name = user_drive.folder_name,
            url_slug    = user_drive.url_slug,
        )

        return AuthResponse(
            access_token = jwt_token,
            user         = user_response
        )
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f'Authentication Failed! {e}'
        )

# Current user info for dashboard
@auth_router.get('/me', response_model=UserResponse)
async def get_me(
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_drive = await user_service.get_user_drive(db, user.id, DriveType.GOOGLE_DRIVE)

    if user_drive is None:
        raise Exception(f"There is no user_drive entry with user_id : {user.id} and drive_type : {DriveType.GOOGLE_DRIVE}")

    return UserResponse(
        id          = user.id,
        username    = user.username,
        email       = user.email,
        picture_url = user.picture_url,
        totp_secret = encryption_util.safe_decrypt(user_drive.totp_secret) if user_drive.totp_secret else None,
        folder_id   = user_drive.folder_id,
        folder_name = user_drive.folder_name,
        url_slug    = user_drive.url_slug,
    )

@auth_router.delete("/me", response_model=DeleteUserResponse, status_code=status.HTTP_200_OK)
async def delete_current_user(
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        username = await user_service.delete_user(db, user.id)
        return {"username": username}
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f"Could not delete user : {str(e)}"
        )

# Token validation middleware
@auth_router.get('/token/validate', status_code=status.HTTP_200_OK)
async def validate_token(token: str):
    payload = jwt_manager.verify_token(token)
    if payload:
        return {
            "valid"   : True,
            "email"   : payload.get("email"),
            "user_id" : payload.get("user_id"),
        }
    else:
        return {
            'valid'  : False,
            'detail' : 'Invalid or Expired Token'
        }