"""
Configuración del microservicio de chatbot.
Carga variables de entorno desde .env
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # Backend Spring Boot
    backend_url: str = "http://localhost:8080"

    # LM Studio
    lm_studio_url: str = "http://localhost:1234"
    lm_studio_model: str = "google-gemma-2-2b-it@q4_k_m"

    # MySQL Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = "root"
    db_name: str = "cuido_database"

    # Microservicio
    api_port: int = 5000

    # Tesseract OCR
    tesseract_path: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    # Rutas de archivos
    uploads_path: str = "../backend/uploads"

    # JWT (debe ser la misma que en Spring Boot)
    jwt_secret: str = "cambiar_por_tu_clave_secreta"
    jwt_algorithm: str = "HS256"

    # LLM Configuration
    llm_temperature: float = 0.7
    llm_max_tokens: int = 500
    llm_context_length: int = 4096

    # Historial de conversación
    max_conversation_history: int = 10

    # OCR Configuration
    ocr_language: str = "spa"  # español

    class Config:
        env_file = ".env"
        case_sensitive = False


# Instancia global de configuración
settings = Settings()
