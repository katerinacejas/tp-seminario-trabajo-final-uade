"""
Configuración de la conexión asíncrona a MySQL usando SQLAlchemy.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from config.settings import settings

# URL de conexión asíncrona para MySQL
DATABASE_URL = (
    f"mysql+aiomysql://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

# Motor asíncrono de SQLAlchemy
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # True para debug SQL
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verifica conexión antes de usar
    pool_recycle=3600,   # Recicla conexiones cada 1 hora
)

# Session factory asíncrona
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base para modelos SQLAlchemy
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency para obtener una sesión de base de datos asíncrona.
    Se usa en los endpoints de FastAPI.

    Yields:
        AsyncSession: Sesión de base de datos asíncrona
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Inicializa la base de datos (opcional).
    No crea tablas porque solo leemos datos existentes.
    """
    # Verificar conexión
    async with engine.begin() as conn:
        # Solo verificamos que podemos conectar
        await conn.run_sync(lambda _: None)
