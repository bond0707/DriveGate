from pydantic import BaseModel, Field

class URLSlug(BaseModel):
    url_slug: str = Field(..., pattern=r"^[a-z0-9-]+$")

class ValidateURLSlugRequest(URLSlug):
    pass

class UpdateURLSlugRequest(URLSlug):
    pass

class UpdateURLSlugResponse(URLSlug):
    pass

class CheckURLSlugAvailabilityRequest(URLSlug):
    pass

class CheckURLSlugAvailabilityResponse(BaseModel):
    available: bool