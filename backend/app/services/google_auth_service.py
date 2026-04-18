import time
import httpx
from fastapi import status
from typing import Dict, Any, Tuple
from app.core.config import settings
from google.oauth2.credentials import Credentials

# Custom exception for invalid/expired refresh tokens
class InvalidRefreshTokenError(Exception):
    """Raised when a refresh token is invalid, expired, or revoked."""
    pass

# For GoogleAuth 2.0 and Drive Operations
class GoogleAuthService:
    # Google Oauth2.0 endpoints
    DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file"
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    # Token cache TTL: 55 minutes (Google tokens last 60 min, 5 min buffer)
    CACHE_TTL_SECONDS = 55 * 60

    def __init__(self):
        # from env
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        # In-memory token cache: {refresh_token_hash: (access_token, expiry_timestamp)}
        self._token_cache: Dict[str, Tuple[str, float]] = {}

    def get_authorization_url(self, force_consent) -> str:
        # defining Permissions
        scopes = [
            'openid',
            'email',
            'profile',
            self.DRIVE_SCOPE # for files modification
        ]

        # Auth url parameter SHitties part to be honest (@Dhruvil brooo google authlib handles this internally (we just need to call functions))
        auth_url = (
            f"{self.GOOGLE_AUTH_URL}?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={'+'.join(scopes)}&" # joins all permission we defined
            f"access_type=offline&"  # Get refresh token for long term access
        )
        if force_consent:
            auth_url += "prompt=consent" # For consent purpose
        else:
            auth_url += "prompt=select_account" # Streamlined login

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
            if settings.ENV_TYPE == "DEV":
                print(token_data)
            response = await client.post(
                self.GOOGLE_TOKEN_URL,
                data=token_data,
                headers={'Content-Type':'application/x-www-form-urlencoded'}
            )

            # Checking if it worked
            if response.status_code != status.HTTP_200_OK:
                error_details = response.json().get("error_description", 'Unkown error')
                raise Exception(f'Token Exchange Failed : {error_details}')

            return response.json()

    # Extracting user info using accesss token
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(self.GOOGLE_USERINFO_URL, headers=headers)
            response.raise_for_status() # raise excpetion for bad status
            return response.json()

    # Chal have longterm mate olu kari dau credentials
    def create_google_credentials(self, token_data: Dict[str, Any]) -> Credentials:
        return Credentials(
            client_id     = self.client_id,
            client_secret = self.client_secret,
            token_uri     = self.GOOGLE_TOKEN_URL,
            token         = token_data.get('access_token'),
            refresh_token = token_data.get('refresh_token'),
            scopes        = [self.DRIVE_SCOPE, "openid", "email", "profile"],
        )

    async def get_access_token(self, refresh_token: str) -> str:
        """
        Gets a Google access token, using cache when available.
        Cache key is hash of refresh_token to avoid storing sensitive data as key.
        """
        # Use hash of refresh token as cache key
        cache_key = str(hash(refresh_token))
        
        # Check cache first
        if cache_key in self._token_cache:
            cached_token, expiry_time = self._token_cache[cache_key]
            if time.time() < expiry_time:
                # Cache hit - return cached token
                return cached_token
            else:
                # Token expired, remove from cache
                del self._token_cache[cache_key]

        # Cache miss - fetch from Google
        token_data = {
            'refresh_token': refresh_token,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'refresh_token'
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.GOOGLE_TOKEN_URL, data=token_data)
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    error_code = error_data.get("error", "")
                    # unauthorized_client -> client creds changed or token revoked
                    # invalid_grant -> token expired or revoked by user
                    if error_code in ("unauthorized_client", "invalid_grant"):
                        raise InvalidRefreshTokenError(
                            "Your Google authorization has expired or been revoked. "
                            "Please sign up again to restore access."
                        )
                except InvalidRefreshTokenError:
                    raise
                except Exception:
                    pass  # Fall through to generic error
                raise Exception(f"Token refresh failed: {response.text}")
            
            access_token = response.json()["access_token"]
            
            # Cache the token with expiry time
            expiry_time = time.time() + self.CACHE_TTL_SECONDS
            self._token_cache[cache_key] = (access_token, expiry_time)
            
            return access_token

google_auth_service = GoogleAuthService()