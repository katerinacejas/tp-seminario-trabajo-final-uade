"""
Modelos Pydantic para request/response de la API REST.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessageRequest(BaseModel):
    """Request para enviar un mensaje al chatbot"""
    mensaje: str = Field(..., description="Mensaje del usuario", min_length=1)
    paciente_id: int = Field(..., description="ID del paciente seleccionado globalmente")

    class Config:
        json_schema_extra = {
            "example": {
                "mensaje": "¿Qué medicamentos debe tomar hoy mi paciente?",
                "paciente_id": 5
            }
        }


class ChatMessageResponse(BaseModel):
    """Response del chatbot"""
    respuesta: str = Field(..., description="Respuesta generada por el chatbot")
    paciente_nombre: str = Field(..., description="Nombre completo del paciente")
    timestamp: datetime = Field(..., description="Fecha y hora de la respuesta")
    mensaje_id: int = Field(..., description="ID del mensaje en la BD")

    class Config:
        json_schema_extra = {
            "example": {
                "respuesta": "Hoy tu paciente debe tomar los siguientes medicamentos:\n\n- **Losartán 50mg** a las 08:00\n- **Metformina 850mg** a las 09:00 y 21:00",
                "paciente_nombre": "Juan Pérez",
                "timestamp": "2025-11-12T14:30:00",
                "mensaje_id": 123
            }
        }


class ConversacionHistorial(BaseModel):
    """Modelo de una conversación en el historial"""
    id: int
    mensaje: str
    respuesta: str
    timestamp: datetime

    class Config:
        from_attributes = True


class HistorialResponse(BaseModel):
    """Response con el historial de conversaciones"""
    conversaciones: List[ConversacionHistorial]
    total: int

    class Config:
        json_schema_extra = {
            "example": {
                "conversaciones": [
                    {
                        "id": 120,
                        "mensaje": "¿Cuándo es la próxima cita?",
                        "respuesta": "La próxima cita médica es el 15 de noviembre...",
                        "timestamp": "2025-11-12T10:00:00"
                    }
                ],
                "total": 1
            }
        }


class ErrorResponse(BaseModel):
    """Response de error"""
    detail: str
    error_code: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "No se pudo conectar con el asistente",
                "error_code": "LLM_UNAVAILABLE"
            }
        }


class HealthResponse(BaseModel):
    """Response de health check"""
    status: str
    database: str
    lm_studio: str
    tesseract: str

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "database": "connected",
                "lm_studio": "available",
                "tesseract": "configured"
            }
        }
