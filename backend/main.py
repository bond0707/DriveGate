import app.models
from app.schemas.generic import *
from app.core.config import settings
from app.routers.auth_router import auth_router
from app.routers.totp_router import totp_router
from app.routers.url_slug_router import url_slug_router
from app.database.connection import engine, Base, get_db

from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    lifespan  = lifespan,
    title     = settings.APP_NAME,
    version   = settings.APP_VERSION,
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

@app.get("/", response_model=RootEndpointResponse, status_code=status.HTTP_200_OK)
async def root():
    return {
        "app_name" : settings.APP_NAME,
        "app_version" : settings.APP_VERSION,
        "status"   : "running",
    }