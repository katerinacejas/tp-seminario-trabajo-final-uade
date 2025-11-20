"""
Utilidades para procesamiento de texto.
"""
import re
from typing import List


class TextProcessor:
    """Procesador de texto para limpiar y normalizar"""

    @staticmethod
    def limpiar_texto(texto: str) -> str:
        """
        Limpia un texto de caracteres especiales y espacios múltiples.

        Args:
            texto: Texto a limpiar

        Returns:
            str: Texto limpio
        """
        # Remover espacios múltiples
        texto = re.sub(r'\s+', ' ', texto)

        # Remover caracteres especiales problemáticos
        texto = texto.replace('\x00', '')

        return texto.strip()

    @staticmethod
    def truncar_texto(texto: str, max_chars: int = 1000) -> str:
        """
        Trunca un texto a una longitud máxima.

        Args:
            texto: Texto a truncar
            max_chars: Longitud máxima

        Returns:
            str: Texto truncado
        """
        if len(texto) <= max_chars:
            return texto

        return texto[:max_chars] + "..."

    @staticmethod
    def extraer_palabras_clave(texto: str) -> List[str]:
        """
        Extrae palabras clave relevantes de un texto.

        Args:
            texto: Texto a analizar

        Returns:
            Lista de palabras clave
        """
        # Palabras a ignorar (stopwords básicas en español)
        stopwords = {
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'por',
            'con', 'para', 'su', 'al', 'lo', 'como', 'más', 'o', 'pero', 'sus',
            'del', 'mi', 'tu', 'te', 'le', 'les', 'me', 'nos', 'os', 'las', 'los'
        }

        # Extraer palabras
        palabras = re.findall(r'\b\w+\b', texto.lower())

        # Filtrar stopwords y palabras muy cortas
        palabras_clave = [
            palabra for palabra in palabras
            if palabra not in stopwords and len(palabra) > 3
        ]

        # Retornar únicas
        return list(set(palabras_clave))
