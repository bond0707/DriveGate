import ssl
from app.core.config import Settings
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

settings = Settings()
ssl_context = ssl.create_default_context(cadata = settings.DB_CA_CERT)

engine = create_async_engine(
    url  = settings.DATABASE_URL,
    echo = True,
    connect_args = {"ssl": ssl_context}
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
