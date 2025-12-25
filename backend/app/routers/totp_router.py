from app.models import UserModel
from fastapi import Depends, status
from fastapi.routing import APIRouter
from app.database.connection import get_db
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.totp_service import totp_service
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user

totp_router = APIRouter()

@totp_router.get("/setup")
async def generate_totp_secret(user: UserModel = Depends(get_current_user)):
    try:
        totp_secret = await totp_service.generate_totp_secret()
        return JSONResponse(
            content = {"totp_secret": totp_secret},  
            status_code = status.HTTP_200_OK,
        )
    except Exception as e:
        return JSONResponse(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            content = {"message": e}
        )

@totp_router.post("/store")
async def verify_and_store_totp_secret(
    user_totp: str,
    user_totp_secret: str,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if await totp_service.verify_totp(user_totp, user_totp_secret):
        try:
            await user_service.update_totp_secret(db, user.id, user_totp_secret)
            return JSONResponse(
                status_code = status.HTTP_200_OK,
                content = {"message": "TOTP Secret stored in DB."}
            )
        except Exception as e:
            return JSONResponse(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                content = {"message": e}
            )

@totp_router.post("/verify")
async def verify_totp(
    totp: str,
    url_slug: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        totp_secret = await user_service.get_totp_secret_by_url_slug(db, url_slug)

        if totp_secret is None or not await totp_service.verify_totp(totp, totp_secret):
            return JSONResponse(
                status_code = status.HTTP_401_UNAUTHORIZED,
                content     = {"is_valid": False}
            )
        else:
            return JSONResponse(
                status_code = status.HTTP_200_OK,
                content     = {"is_valid": True}
            )
    except Exception as e:
        return JSONResponse(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            content = {"message": e}
        )


