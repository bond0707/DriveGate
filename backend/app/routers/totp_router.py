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

@totp_router.post("/setup")
async def generate_totp_secret(user: UserModel = Depends(get_current_user)):
    try:
        totp_secret = await totp_service.generate_client_secret()
        return JSONResponse(
            content = {"totp_secret": totp_secret},  
            status_code = status.HTTP_200_OK,
        )
    except Exception as e:
        return JSONResponse(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            content = {"message": f"{e}", "traceback": f"{e.with_traceback()}"}
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
            user_service.update_user(db, user, {"totp_secret": user_totp_secret})
            return JSONResponse(
                status_code = status.HTTP_200_OK,
                detail = "TOTP Secret stored in DB." # @Dhruvil, is this good? or should I avoid using 'detail'?
            )
        except Exception as e:
            return JSONResponse(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                content = {"message": f"{e}", "traceback": f"{e.with_traceback()}"}
            )

@totp_router.post("/verify")
async def verify_totp(
    totp: str,
    url_slug: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        totp_secret = await user_service.get_totp_secret_by_url_slug(url_slug, db)
        if await totp_service.verify_totp(totp, totp_secret):
            return JSONResponse(
                status_code = status.HTTP_200_OK,
                detail = "TOTP is valid!"
            )
        else:
            return JSONResponse(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail = "TOTP is invalid!"
            )
    except Exception as e:
        return JSONResponse(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            content = {"message": f"{e}", "traceback": f"{e.with_traceback()}"}
        )



"""
OUR FLOW.

NextJS tells FastAPI to setup totp for the first time (/setup)
FastAPI returns the randomly generated totp_secret (generate_totp_secret())
NextJS uses that to generate and display a QR Code to the user
The user scans that and adds the totp_secret to their authenticator app
The user then enters the otp and clicks submit
NextJS sends it to FastAPI along with the totp_secret (at this point there is no totp_secret for the user in db) (/store)
FastAPI verifies the TOTP and if correct, stores it in db. (/store)
Then from the next time, NextJS sends the URL slug
FastAPI fetches the totp_secret using that URL slug (/{url_slug} in main.py)
User enters TOTP
NextJS sends this TOTP to FastAPI (/verify)
FastAPI verifies it and gives response accordingly. (Kirtan (Response 200 OK) / Dhruvil (ERROR 6969 Gay))
"""
