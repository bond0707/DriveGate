from sqlalchemy.exc import IntegrityError
from app.models.UserModel import UserModel
from fastapi.responses import JSONResponse
from app.database.connection import get_db
from fastapi import APIRouter, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user_service import user_service
from app.utils.dependencies import get_current_user

url_slug_router = APIRouter()

@url_slug_router.patch("/update")
async def update_url_slug(
    url_slug: str,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    try:
        user = await user_service.update_url_slug(db, user.id, url_slug)
        return JSONResponse(
            status_code = status.HTTP_200_OK,
            content     = {"url_slug": user.upload_url}   
        )
    except IntegrityError as e:
        return JSONResponse(
            status_code = status.HTTP_409_CONFLICT,
            content     = {"message": e}
        )
    except Exception as e:
        return JSONResponse(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            content     = {"message": e}
        )