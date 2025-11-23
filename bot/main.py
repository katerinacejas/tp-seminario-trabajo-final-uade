"""
Punto de entrada principal del microservicio de chatbot.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Importar configuración y dependencias
from config.settings import settings
from config.database import init_db, engine
from routers import chatbot
from services.llm_service import LLMService
from models.api_models import HealthResponse
import pytesseract
from create_table import create_table


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager para inicializar y limpiar recursos.
    """
    # Startup
    logger.info("=" * 60)
    logger.info("🚀 Iniciando microservicio de chatbot Cuido")
    logger.info("=" * 60)

    try:
        # Verificar conexión a BD
        await init_db()
        logger.info("✅ Conexión a MySQL establecida")
        await create_table()
        logger.info("🛠️ Tabla conversaciones_chatbot verificada/creada")

        # Verificar LM Studio
        llm = LLMService()
        if await llm.verificar_disponibilidad():
            logger.info("✅ LM Studio disponible")
        else:
            logger.warning("⚠️ LM Studio no está disponible. El chatbot no funcionará correctamente.")

        # Verificar Tesseract
        try:
            version = pytesseract.get_tesseract_version()
            logger.info(f"✅ Tesseract OCR v{version} configurado")
        except Exception as e:
            logger.warning(f"⚠️ Tesseract no disponible: {e}")

        logger.info(f"🌐 Servidor escuchando en puerto {settings.api_port}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ Error durante la inicialización: {e}")
        raise

    yield

    # Shutdown
    logger.info("🛑 Cerrando microservicio de chatbot...")
    await engine.dispose()
    logger.info("✅ Recursos liberados")


# Crear aplicación FastAPI
app = FastAPI(
    title="Cuido Chatbot API",
    description="Microservicio de chatbot con IA local para la aplicación Cuido",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(chatbot.router)


# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Verifica el estado del microservicio y sus dependencias.

    Returns:
        HealthResponse con el estado de cada componente
    """
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "lm_studio": "unknown",
        "tesseract": "unknown"
    }

    # Verificar base de datos
    try:
        await init_db()
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"

    # Verificar LM Studio
    try:
        llm = LLMService()
        if await llm.verificar_disponibilidad():
            health_status["lm_studio"] = "available"
        else:
            health_status["lm_studio"] = "unavailable"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["lm_studio"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    # Verificar Tesseract
    try:
        pytesseract.get_tesseract_version()
        health_status["tesseract"] = "configured"
    except Exception as e:
        health_status["tesseract"] = f"error: {str(e)}"

    return health_status


@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint raíz con información del servicio.

    Returns:
        Información básica del servicio
    """
    return {
        "service": "Cuido Chatbot API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


# Manejador global de excepciones
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Maneja excepciones no capturadas.

    Args:
        request: Request HTTP
        exc: Excepción

    Returns:
        JSONResponse con el error
    """
    logger.error(f"Error no manejado: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "error_code": "INTERNAL_SERVER_ERROR"
        }
    )


# Entry point para ejecutar directamente
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.api_port,
        reload=True,  # Hot reload en desarrollo
        log_level="info"
    )
