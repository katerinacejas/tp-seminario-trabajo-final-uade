"""
Servicio de LLM para interactuar con LM Studio (Gemma-2-2b-it).
"""
from openai import OpenAI, OpenAIError
from config.settings import settings
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class LLMService:
    """Servicio para interactuar con LM Studio usando el cliente OpenAI"""

    def __init__(self):
        """Inicializa el cliente de LM Studio"""
        self.client = OpenAI(
            base_url=f"{settings.lm_studio_url}/v1",
            api_key="not-needed"  # LM Studio no requiere API key real
        )
        self.model = settings.lm_studio_model

    async def generar_respuesta(
        self,
        messages: List[Dict[str, str]],
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        """
        Genera una respuesta usando Gemma a través de LM Studio.

        Args:
            messages: Lista de mensajes en formato OpenAI
                      [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
            temperature: Temperatura para la generación (default desde settings)
            max_tokens: Máximo de tokens a generar (default desde settings)

        Returns:
            str: Respuesta generada por el modelo

        Raises:
            Exception: Si LM Studio no está disponible o hay error
        """
        try:
            temperature = temperature or settings.llm_temperature
            max_tokens = max_tokens or settings.llm_max_tokens

            logger.info(f"Enviando {len(messages)} mensajes a LM Studio...")

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False
            )

            respuesta = completion.choices[0].message.content
            logger.info("Respuesta generada exitosamente")

            return respuesta.strip()

        except OpenAIError as e:
            logger.error(f"Error de OpenAI/LM Studio: {e}")
            raise Exception("Lo siento, el asistente no está disponible en este momento. Verifica que LM Studio esté ejecutándose.")
        except Exception as e:
            logger.error(f"Error inesperado en LLM: {e}")
            raise Exception(f"Error al generar respuesta: {str(e)}")

    async def verificar_disponibilidad(self) -> bool:
        """
        Verifica si LM Studio está disponible y respondiendo.

        Returns:
            bool: True si está disponible, False en caso contrario
        """
        try:
            # Intentar obtener la lista de modelos
            models = self.client.models.list()
            return True
        except Exception as e:
            logger.warning(f"LM Studio no disponible: {e}")
            return False

    def contar_tokens_aproximado(self, texto: str) -> int:
        """
        Cuenta tokens de forma aproximada (4 caracteres ≈ 1 token).

        Args:
            texto: Texto a contar

        Returns:
            int: Cantidad aproximada de tokens
        """
        return len(texto) // 4

    def truncar_mensajes_si_necesario(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = None
    ) -> List[Dict[str, str]]:
        """
        Trunca mensajes si exceden el límite de tokens del contexto.

        Args:
            messages: Lista de mensajes
            max_tokens: Límite de tokens (default: context_length - buffer)

        Returns:
            Lista de mensajes truncados
        """
        max_tokens = max_tokens or (settings.llm_context_length - 600)  # Buffer para respuesta

        # Calcular tokens actuales
        tokens_actuales = sum(
            self.contar_tokens_aproximado(msg["content"])
            for msg in messages
        )

        if tokens_actuales <= max_tokens:
            return messages

        logger.warning(f"Mensajes exceden límite ({tokens_actuales} > {max_tokens}), truncando...")

        # Mantener siempre el system prompt (primer mensaje)
        system_prompt = messages[0] if messages and messages[0]["role"] == "system" else None
        otros_mensajes = messages[1:] if system_prompt else messages

        # Remover mensajes más antiguos hasta estar bajo el límite
        while otros_mensajes and tokens_actuales > max_tokens:
            mensaje_removido = otros_mensajes.pop(0)
            tokens_actuales -= self.contar_tokens_aproximado(mensaje_removido["content"])

        # Reconstruir lista
        if system_prompt:
            return [system_prompt] + otros_mensajes
        return otros_mensajes
