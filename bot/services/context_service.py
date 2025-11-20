"""
Servicio para gestionar el contexto y el historial de conversación.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from models.database_models import ConversacionChatbot
from typing import List, Dict
from config.settings import settings
import logging

logger = logging.getLogger(__name__)


class ContextService:
    """Servicio para manejar el historial de conversaciones"""

    @staticmethod
    async def obtener_historial(
        db: AsyncSession,
        usuario_id: int,
        paciente_id: int,
        limit: int = None
    ) -> List[ConversacionChatbot]:
        """
        Obtiene el historial de conversaciones de un usuario con un paciente específico.

        Args:
            db: Sesión de base de datos
            usuario_id: ID del usuario (cuidador)
            paciente_id: ID del paciente
            limit: Cantidad máxima de conversaciones (default desde settings)

        Returns:
            Lista de ConversacionChatbot ordenadas de más antigua a más reciente
        """
        limit = limit or settings.max_conversation_history

        query = (
            select(ConversacionChatbot)
            .where(
                and_(
                    ConversacionChatbot.usuario_id == usuario_id,
                    ConversacionChatbot.paciente_id == paciente_id
                )
            )
            .order_by(desc(ConversacionChatbot.created_at))
            .limit(limit)
        )

        result = await db.execute(query)
        conversaciones = result.scalars().all()

        # Invertir para tener orden cronológico (más antiguo primero)
        return list(reversed(conversaciones))

    @staticmethod
    async def guardar_conversacion(
        db: AsyncSession,
        usuario_id: int,
        paciente_id: int,
        mensaje: str,
        respuesta: str
    ) -> ConversacionChatbot:
        """
        Guarda una nueva conversación en la base de datos.

        Args:
            db: Sesión de base de datos
            usuario_id: ID del usuario (cuidador)
            paciente_id: ID del paciente
            mensaje: Mensaje del usuario
            respuesta: Respuesta del chatbot

        Returns:
            ConversacionChatbot guardada
        """
        conversacion = ConversacionChatbot(
            usuario_id=usuario_id,
            paciente_id=paciente_id,
            mensaje=mensaje,
            respuesta=respuesta
        )

        db.add(conversacion)
        await db.commit()
        await db.refresh(conversacion)

        logger.info(f"Conversación guardada con ID {conversacion.id}")
        return conversacion

    @staticmethod
    async def borrar_historial(
        db: AsyncSession,
        usuario_id: int,
        paciente_id: int = None
    ) -> int:
        """
        Borra el historial de conversaciones de un usuario.

        Args:
            db: Sesión de base de datos
            usuario_id: ID del usuario
            paciente_id: ID del paciente (opcional, si no se especifica borra todo)

        Returns:
            int: Cantidad de conversaciones borradas
        """
        if paciente_id:
            query = select(ConversacionChatbot).where(
                and_(
                    ConversacionChatbot.usuario_id == usuario_id,
                    ConversacionChatbot.paciente_id == paciente_id
                )
            )
        else:
            query = select(ConversacionChatbot).where(
                ConversacionChatbot.usuario_id == usuario_id
            )

        result = await db.execute(query)
        conversaciones = result.scalars().all()

        for conv in conversaciones:
            await db.delete(conv)

        await db.commit()

        logger.info(f"Borradas {len(conversaciones)} conversaciones del usuario {usuario_id}")
        return len(conversaciones)

    @staticmethod
    def formatear_historial_para_llm(
        conversaciones: List[ConversacionChatbot]
    ) -> List[Dict[str, str]]:
        """
        Formatea el historial de conversaciones para el formato de mensajes de OpenAI.

        Args:
            conversaciones: Lista de ConversacionChatbot

        Returns:
            Lista de mensajes en formato {"role": "user/assistant", "content": "..."}
        """
        mensajes = []

        for conv in conversaciones:
            # Mensaje del usuario
            mensajes.append({
                "role": "user",
                "content": conv.mensaje
            })

            # Respuesta del asistente
            mensajes.append({
                "role": "assistant",
                "content": conv.respuesta
            })

        return mensajes

    @staticmethod
    async def obtener_contexto_completo(
        db: AsyncSession,
        usuario_id: int,
        paciente_id: int
    ) -> Dict[str, any]:
        """
        Obtiene todo el contexto necesario para una conversación.

        Args:
            db: Sesión de base de datos
            usuario_id: ID del usuario
            paciente_id: ID del paciente

        Returns:
            Dict con el historial y metadata
        """
        historial = await ContextService.obtener_historial(db, usuario_id, paciente_id)

        return {
            "historial": historial,
            "mensajes_formateados": ContextService.formatear_historial_para_llm(historial),
            "cantidad_mensajes": len(historial)
        }
