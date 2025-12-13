from fastapi import FastAPI
from app.models import UserModel
from contextlib import asynccontextmanager
from app.database.connection import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def return_homepage():
    return {"response": "TOTP Drive Uploader"}
