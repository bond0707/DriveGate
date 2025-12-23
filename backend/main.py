from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import UserModel
from contextlib import asynccontextmanager
from app.database.connection import engine, Base


# Route imports
from app.routers.Auth_Router import Auth_Router



@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan,
              docs_url="/docs",  
            redoc_url="/redoc"
            )

# For nextjs we gotta do this 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Router Endpoint
app.include_router(Auth_Router, prefix='/auth', tags=['Authentication'])

@app.get("/")
def return_homepage():
    return {"response": "TOTP Drive Uploader"}
