from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
import httpx
from typing import Dict, Any, Optional
import json
from datetime import datetime, timedelta


from app.core.config import settings


# For GoogleAuth 2.0 and Drive Operations

class GoogleAuthService:
    # Google Oauth2.0 endpoints
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    # Google Drive api
    DRIVE_API_VERSION = "v3"
    DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file"

    def __init__(self):

        # from env
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def get_authorization_url(self) -> str:

        # defining Permissions
        scopes = [
            'openid',
            'email',
            'profile',
            self.DRIVE_SCOPE # for files modification
        ]

        # Auth url parameter SHitties part to be honest
        auth_url = (
            f"{self.GOOGLE_AUTH_URL}?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={'+'.join(scopes)}&" # joins all permission we defined
            f"access_type=offline&"  # Get refresh token for long term access
            f"prompt=consent" # for consent purpose
        )

        return auth_url

    # Access authorization code for access and refresh token
    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        token_data = {
            'code': code,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.redirect_uri,
            'grant_type': 'authorization_code'
        }

        # Sending request to google [post]
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.GOOGLE_TOKEN_URL,
                data=token_data,
                headers={'Content-Type':'application/x-www-form-urlencoded'}
            )

            # Checking if rizz worked
            if response.status_code != 200:
                # Kirtan's fault not mine
                error_details = response.json().get("error description",'Unkown error')
                raise Exception(f'Token Exchanged Failed Because of Kirtan: {error_details}')

            return response.json()

    # Extracting user info using accesss token
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(self.GOOGLE_USERINFO_URL, headers=headers)
            response.raise_for_status() # raise excpetion for bad status
            return response.json()


    # Creating drive folder as we discussed chigga change if you want to
    async def create_drive_folder(self, access_token: str, user_email: str) -> str:
        try:
            # Create credentials object from access token
            credentials = Credentials(token=access_token)

            # Build google Drive Service Client
            drive_service = build(
                'drive',
                self.DRIVE_API_VERSION,
                credentials=credentials
            )

            # Folder name it's temp for now change if you want
            folder_name= f'TOTP_UPLOADER'
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'description': 'TOTP UPLOADER FILES'
            }

            # IDK THIS PART AI USED
            # Create folder
            folder = drive_service.files().create(
                body=folder_metadata,
                fields='id'  # Only return the folder ID
            ).execute()

            return folder.get('id')

        except HttpError as e:
            raise Exception(f'Google Drive APi Error: {e}')
        except Exception as er:
            raise Exception(f'FAiled to Create Drive Uploader: {er}')

    # Chal have longterm mate olu kari dau credentials
    def create_google_credentials(self, token_data: Dict[str, Any]) -> Credentials:
        return Credentials(
            token=token_data.get('access_token'),
            refresh_token=token_data.get('refresh_token'),
            token_uri=self.GOOGLE_TOKEN_URL,
            client_id=self.client_id,
            client_secret=self.client_secret,
            scopes=[self.DRIVE_SCOPE, "openid", "email", "profile"]
        )


google_auth_service = GoogleAuthService()




'''
idk if we need this
async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
    token_data = {
        'refresh_token': refresh_token,
        'client_id': self.client_id,
        'client_secret': self.client_secret,
        'grant_type': 'refresh_token'
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(self.GOOGLE_TOKEN_URL, data=token_data)
        if response.status_code != 200:
            raise Exception(f"Token refresh failed: {response.text}")
        return response.json()
'''