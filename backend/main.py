from app.models import UserModel
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from app.database.connection import get_db
from fastapi import FastAPI, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.routers.auth_router import auth_router
from app.routers.totp_router import totp_router
from app.database.connection import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from app.services.user_service import user_service
from app.routers.url_slug_router import url_slug_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    lifespan  = lifespan,
    docs_url  = "/docs",   # these bottom two are default values so not needed
    redoc_url = "/redoc"   # but i am keeping them because you kept them.
)

# For nextjs we gotta do this (copy understood)
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_methods = ["*"],
    allow_headers = ["*"],
    allow_credentials = True,
)

app.include_router(
    router = auth_router, 
    prefix = '/auth', 
    tags   = ['Authentication']
)
app.include_router(
    router = totp_router, 
    prefix = '/totp', 
    tags   = ['TOTP']
)
app.include_router(
    router = url_slug_router, 
    prefix = '/url', 
    tags   = ['URL Slug']
)

@app.get("/home")
def return_homepage():
    return JSONResponse(
        status_code = status.HTTP_200_OK,
        content     = {"app name": "TOTP Drive Uploader"},
    )

@app.get("/{url_slug}")
async def verify_totp(
    url_slug: str, 
    db: AsyncSession = Depends(get_db)
):
    totp_secret = await user_service.get_totp_secret_by_url_slug(db, url_slug)
    if totp_secret is not None:
        return JSONResponse(
            status_code = status.HTTP_200_OK,
            content     = {"message": "Url slug is valid!", "secret": totp_secret}
        )
    else:
        return JSONResponse(
            status_code = status.HTTP_404_NOT_FOUND,
            content     = {"message": "Url slug is invalid, redirect to marketing page (to-do)!"}
        )
        