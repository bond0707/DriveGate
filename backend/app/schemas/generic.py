from pydantic import BaseModel

# Use this instead of JSONResponse (for pydantic auto-checking)
class MessageResponse(BaseModel):
    message: str

class RootEndpointResponse(BaseModel):
    app_name: str
    app_version: str
    status: str