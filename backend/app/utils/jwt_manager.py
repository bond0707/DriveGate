from jose import JWTError, jwt
from app.core.config import settings
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

class JWTManager:
    """
    Our tokens contain:
    - user_id: To identify which user
    - email: User's email
    - exp: Expiration time
    - iat: Issued at time
    """
    def __init__(self):
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.access_token_expire_minutes = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        # Create a copy of the data to avoid modifying original
        to_encode = data.copy()
        
        # Calculate expiration time
        expire = datetime.now() + timedelta(minutes=self.access_token_expire_minutes)

        # Add standard JWT claims
        to_encode.update({
            "exp": expire,  # Expiration time
            "iat": datetime.now(),  # Issued at time
            "type": "access"  # Token type (useful if we have refresh tokens)
        })
        
        # Encode the JWT token
        encoded_jwt = jwt.encode(
            to_encode, 
            self.secret_key, 
            algorithm=self.algorithm
        )
        return encoded_jwt
    
    def verify_token(self, token: str, expected_type: str = "access") -> Optional[Dict[str, Any]]:
        try:
            # Decode and verify the token
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            
            # Check if token is expired (jwt.decode does this automatically)
            # Check token type matches expected type
            if payload.get("type") != expected_type:
                return None
                
            return payload
            
        except JWTError:
            # Token is invalid, expired, or tampered with
            return None
    
    def create_user_token(self, user_id: int, email: str) -> str:
        data = {
            "user_id": user_id,
            "email": email,
            "sub": str(user_id)  # Standard JWT subject claim
        }
        
        return self.create_access_token(data)
    
    def create_upload_token(
        self,
        url_slug: str,
        folder_id: str,
        folder_name: str,
        google_access_token: str,
        ) -> str:
        """
        Creates an upload token with a shorter TTL (15 minutes) for security.
        Contains the Google access token, folder ID, and URL slug.
        """
        data = {
            "url_slug": url_slug,
            "folder_id": folder_id,
            "folder_name": folder_name,
            "google_access_token": google_access_token,
        }
        
        # Use shorter expiration for upload tokens (15 minutes)
        to_encode = data.copy()
        expire = datetime.now() + timedelta(minutes=15)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(),
            "type": "upload"  # Different type to distinguish from user tokens
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def extract_user_id(self, token: str) -> Optional[int]:
        payload = self.verify_token(token)
        if payload:
            return payload.get("user_id")
        return None
    
    def is_token_expired(self, token: str) -> bool:
        payload = self.verify_token(token)
        return payload is None

jwt_manager = JWTManager()