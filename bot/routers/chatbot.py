"""
Router de endpoints del chatbot.
"""
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models.api_models import (
    ChatMessageRequest, ChatMessageResponse,
    HistorialResponse, ConversacionHistorial,
    ErrorResponse
)
from services.auth_service import AuthService, security
from services.patient_service import PatientService
from services.data_service import DataService
from services.document_service import DocumentService
from services.context_service import ContextService
from services.llm_service import LLMService
from utils.prompt_builder import PromptBuilder
from models.database_models import TipoDocumentoEnum
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

# Instancia del servicio LLM
llm_service = LLMService()
document_service = DocumentService()


@router.post("/message", response_model=ChatMessageResponse)
async def enviar_mensaje(
    request: ChatMessageRequest,
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
):
    """
    Envía un mensaje al chatbot y recibe una respuesta.

    Args:
        request: Mensaje y paciente ID
        credentials: Token JWT
        db: Sesión de base de datos

    Returns:
        ChatMessageResponse con la respuesta del chatbot
    """
    try:
        # 1. AUTENTICACIÓN
        usuario = await AuthService.get_current_user(credentials, db)
        logger.info(f"Usuario autenticado: {usuario.email} (ID: {usuario.id})")

        # 2. RESOLVER PACIENTE
        paciente, error_msg = await PatientService.resolver_paciente_desde_mensaje(
            db,
            request.mensaje,
            request.paciente_id,
            usuario.id
        )

        if error_msg:
            raise HTTPException(status_code=404, detail=error_msg)

        logger.info(f"Paciente seleccionado: {paciente.nombre_completo} (ID: {paciente.id})")

        # 3. DETECTAR INTENCIÓN
        intenciones = DataService.detectar_intencion(request.mensaje)
        logger.info(f"Intenciones detectadas: {intenciones}")

        # 4. OBTENER DATOS RELEVANTES
        contexto_datos = {}

        # Información básica del paciente
        contexto_datos["usuario"] = paciente
        contexto_datos["info_medica"] = await PatientService.obtener_info_medica_paciente(
            db, paciente.id
        )

        # Datos según la intención
        if "medicamentos" in intenciones:
            contexto_datos["medicamentos"] = await DataService.obtener_medicamentos_activos(
                db, paciente.id
            )

        if "citas" in intenciones:
            contexto_datos["citas"] = await DataService.obtener_citas_proximas(
                db, paciente.id
            )

        if "bitacoras" in intenciones:
            contexto_datos["bitacoras"] = await DataService.obtener_bitacoras_recientes(
                db, paciente.id
            )

        if "tareas" in intenciones:
            contexto_datos["tareas"] = await DataService.obtener_tareas_pendientes(
                db, paciente.id
            )

        if "contactos" in intenciones:
            contexto_datos["contactos"] = await DataService.obtener_contactos_emergencia(
                db, paciente.id
            )

        # 5. PROCESAR DOCUMENTOS SI ES NECESARIO
        if "documentos" in intenciones:
            documentos = await DataService.obtener_documentos_paciente(db, paciente.id)

            if documentos:
                # Lista simple con metadatos para responder "qué documentos hay"
                contexto_datos["documentos_lista"] = [
                    {
                        "id": doc.id,
                        "nombre": doc.nombre,
                        "tipo": doc.tipo.value,
                        "descripcion": doc.descripcion,
                        "fecha": doc.updated_at.isoformat() if doc.updated_at else None,
                        "mime_type": doc.mime_type,
                    }
                    for doc in documentos
                ]

                mensaje_lower = request.mensaje.lower()

                # ¿El usuario está pidiendo RESUMEN o DETALLE?
                quiere_resumen = any(
                    palabra in mensaje_lower
                    for palabra in ["resumen", "detalle", "explicación", "explicacion"]
                )

                # Palabras médicas / de estudio para buscar dentro del texto
                palabra_clave = None
                palabras_medicas = [
                    "radiografia", "radiografía", "rayos x",
                    "tiroides", "glucosa",
                    "presión", "presion",
                    "colesterol", "hemograma",
                    "laboratorio", "sangre", "analisis de sangre", "análisis de sangre",
                    "estudio", "radiografia", "documento"
                ]
                for palabra in palabras_medicas:
                    if palabra in mensaje_lower:
                        palabra_clave = palabra
                        break

                # Por defecto, ningún documento seleccionado para OCR
                documentos_para_ocr = []

                # Si el usuario menciona "análisis de sangre", intentamos filtrar ese documento
                if "analisis de sangre" in mensaje_lower or "análisis de sangre" in mensaje_lower:
                    for doc in documentos:
                        nombre_desc = f"{doc.nombre or ''} {doc.descripcion or ''}".lower()
                        if "analisis de sangre" in nombre_desc or "análisis de sangre" in nombre_desc or "sangre" in nombre_desc:
                            documentos_para_ocr.append(doc)
                
				# Si el usuario menciona "radiografia", intentamos filtrar ese documento
                if "radiografia" in mensaje_lower or "radiografía" in mensaje_lower:
                    for doc in documentos:
                        nombre_desc = f"{doc.nombre or ''} {doc.descripcion or ''}".lower()
                        if "radiografia" in nombre_desc or "radiografía" in nombre_desc:
                            documentos_para_ocr.append(doc)

                # Si no encontramos específicamente el de sangre, pero igual pide resumen,
                # podrías elegir NO hacer OCR (o como fallback, usar todos, pero eso vuelve a ser pesado)
                # Acá elegimos: solo hacer OCR si pudimos filtrar al menos 1 doc
                if (quiere_resumen or palabra_clave) and documentos_para_ocr:
                    logger.info(f"Procesando {len(documentos_para_ocr)} documentos con OCR...")
                    resultados_ocr = await document_service.procesar_documentos_paciente(
                        documentos_para_ocr,
                        palabra_clave
                    )
                    contexto_datos["documentos_ocr"] = resultados_ocr



        # 6. OBTENER HISTORIAL DE CONVERSACIÓN
        contexto_historial = await ContextService.obtener_contexto_completo(
            db, usuario.id, paciente.id
        )

        # 7. CONSTRUIR PROMPT
        messages = PromptBuilder.construir_prompt_completo(
            request.mensaje,
            contexto_datos,
            contexto_historial["mensajes_formateados"]
        )

        # 8. TRUNCAR SI ES NECESARIO
        messages = llm_service.truncar_mensajes_si_necesario(messages)

        # 9. GENERAR RESPUESTA CON LLM
        logger.info("Generando respuesta con LM Studio...")
        respuesta = await llm_service.generar_respuesta(messages)

        # 10. GUARDAR CONVERSACIÓN
        conversacion = await ContextService.guardar_conversacion(
            db, usuario.id, paciente.id, request.mensaje, respuesta
        )

        # 11. RETORNAR RESPUESTA
        return ChatMessageResponse(
            respuesta=respuesta,
            paciente_nombre=paciente.nombre_completo,
            timestamp=conversacion.created_at,
            mensaje_id=conversacion.id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en enviar_mensaje: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar el mensaje: {str(e)}"
        )


@router.get("/history/{paciente_id}", response_model=HistorialResponse)
async def obtener_historial(
    paciente_id: int,
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene el historial de conversaciones con un paciente específico.

    Args:
        paciente_id: ID del paciente
        credentials: Token JWT
        db: Sesión de base de datos

    Returns:
        HistorialResponse con las conversaciones
    """
    try:
        # Autenticación
        usuario = await AuthService.get_current_user(credentials, db)

        # Verificar acceso al paciente
        print("el paciente_id que llego es", paciente_id)
        print("el cuidador id q llego es: ",  usuario.id)
        tiene_acceso = await PatientService.verificar_acceso_cuidador(
            db, usuario.id, paciente_id
        )

        if not tiene_acceso:
            raise HTTPException(
                status_code=403,
                detail="No tienes acceso a este paciente"
            )

        # Obtener historial
        historial = await ContextService.obtener_historial(
            db, usuario.id, paciente_id
        )

        # Convertir a modelo de respuesta
        conversaciones = [
            ConversacionHistorial(
                id=conv.id,
                mensaje=conv.mensaje,
                respuesta=conv.respuesta,
                timestamp=conv.created_at
            )
            for conv in historial
        ]
        
        if conversaciones == None:
            print("conversaciones es nulo")

        return HistorialResponse(
            conversaciones=conversaciones,
            total=len(conversaciones)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en obtener_historial: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error al obtener el historial"
        )


@router.delete("/history/{paciente_id}")
async def borrar_historial(
    paciente_id: int,
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
):
    """
    Borra el historial de conversaciones con un paciente específico.

    Args:
        paciente_id: ID del paciente
        credentials: Token JWT
        db: Sesión de base de datos

    Returns:
        Mensaje de confirmación
    """
    try:
        # Autenticación
        usuario = await AuthService.get_current_user(credentials, db)

        # Borrar historial
        cantidad = await ContextService.borrar_historial(
            db, usuario.id, paciente_id
        )

        return {
            "message": f"Se borraron {cantidad} conversaciones",
            "cantidad": cantidad
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en borrar_historial: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error al borrar el historial"
        )
