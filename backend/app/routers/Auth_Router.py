# Our functions that will finally get to use mate this shit pmo (LESSGO (I, Dhruvil Adroja, am gay!)
from fastapi.responses import JSONResponse
from app.models.UserModel import UserModel
from app.database.connection import get_db
from app.utils.jwt_handler import jwt_manager
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.google_auth_service import google_auth_service
from app.schemas.User import GoogleAuthRequest, AuthResponse, UserResponse

auth_router = APIRouter()

@auth_router.get('/google/login')
async def google_login():
    try: 
        auth_url = google_auth_service.get_authorization_url()
        return JSONResponse(
            status_code = status.HTTP_200_OK,
            content     = {'auth_url': auth_url}
        )
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

        access_token = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')

        if not access_token:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail      = 'Failed to get access token from google'
            )
        
        # Get user info from AccessToken
        user_info = await google_auth_service.get_user_info(access_token)

        # Extract feilds from user_info (EZY part)
        email = user_info.get('email')
        google_uuid = user_info.get('sub')
        username = user_info.get('name', email.split('@')[0]) # Fallback: extract username from email

        if not google_uuid or not email:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail      = "Invalid user info from Google"
            )
        
        # Check if the user exsists
        user = await user_service.get_user_by_email(db, email)

        if not user:
            # Create a user if doesn't exsist
            user_data = {
                'email': email,
                'username': username,
                'google_uuid': google_uuid,
                'google_refresh_token': refresh_token or '' # fall back test for now (i think this fallback is not needed as we set access_type = offline & prompt = consent)
            }
            user = await user_service.create_user(db, user_data)

            # Create Google Drive Folder by Our Name
            try:
                folder_id = await google_auth_service.create_drive_folder(access_token)
                # update the db
                user = await user_service.update_user(db, user, {"drive_folder_id": folder_id})
            except Exception as fe:
                print(f"Warning: Failed to create Drive folder: {fe}")
        else:
            # Existing user - update refresh token if we got a new one
            if refresh_token:
                user = await user_service.update_user(db, user, {'google_refresh_token': refresh_token})
        
        # Generate our JWT token
        jwt_token = jwt_manager.create_user_token(user.id, user.email)

        # Step 7: Prepare response
        user_response = UserResponse.model_validate(user)

        return AuthResponse(
            access_token = jwt_token,
            user         = user_response
        )
    except HTTPException:
        raise ## ? raise what? (for @Dhruvil)

    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = f'Authentication Failed! {e}'
        )

# Current user info for dashbord or whatsoever
@auth_router.get('/me', response_model = UserResponse)
async def get_current_user(current_user: UserModel = Depends(get_current_user)):    
    return UserResponse.model_validate(current_user)

# kinda middleware
@auth_router.get('/validate-token')
async def validate_token(token: str):
    payload = jwt_manager.verify_token(token)
    if payload:
        return {
            "valid": True,
            "user_id": payload.get("user_id"),
            "email": payload.get("email")
        }
    
    else:
        return{
            'valid': False,
            'detail': 'Invalid or Expired Token'
        }


