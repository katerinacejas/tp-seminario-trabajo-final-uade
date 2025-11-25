"""
Servicio de procesamiento de documentos con OCR.
Extrae texto de PDFs e imágenes usando Tesseract.
"""
import os
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from typing import List, Optional, Dict
from config.settings import settings
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class DocumentService:
    """Servicio para procesar documentos con OCR"""

    def __init__(self):
        """Inicializa el servicio de documentos"""
        # Configurar ruta de Tesseract
        if settings.tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = settings.tesseract_path

    @staticmethod
    def extraer_texto_de_imagen(ruta_imagen: str) -> str:
        """
        Extrae texto de una imagen usando Tesseract OCR.

        Args:
            ruta_imagen: Ruta al archivo de imagen

        Returns:
            str: Texto extraído

        Raises:
            Exception: Si hay error al procesar la imagen
        """
        try:
            imagen = Image.open(ruta_imagen)
            texto = pytesseract.image_to_string(
                imagen,
                lang=settings.ocr_language,  # español
                config='--psm 3'  # Page segmentation mode: Fully automatic
            )
            return texto.strip()
        except Exception as e:
            logger.error(f"Error al extraer texto de imagen {ruta_imagen}: {e}")
            raise Exception(f"No pude procesar la imagen: {str(e)}")

    @staticmethod
    def extraer_texto_de_pdf(ruta_pdf: str) -> str:
        """
        Extrae texto de un PDF usando OCR.
        Convierte cada página a imagen y luego aplica OCR.

        Args:
            ruta_pdf: Ruta al archivo PDF

        Returns:
            str: Texto completo extraído de todas las páginas

        Raises:
            Exception: Si hay error al procesar el PDF
        """
        try:
            # Armamos los parámetros para pdf2image
            kwargs = {
                "dpi": 300,       # Buena calidad para OCR
                "fmt": "jpeg",
                "thread_count": 2
            }

            # Si tenemos configurado poppler_path en settings, lo usamos
            if settings.poppler_path:
                kwargs["poppler_path"] = settings.poppler_path

            # Convertir PDF a imágenes
            imagenes = convert_from_path(
                ruta_pdf,
                **kwargs
            )

            texto_completo = []

            # Aplicar OCR a cada página
            for i, imagen in enumerate(imagenes, start=1):
                logger.info(f"Procesando página {i} de {len(imagenes)}...")
                texto_pagina = pytesseract.image_to_string(
                    imagen,
                    lang=settings.ocr_language,  # español
                    config='--psm 3'
                )
                texto_completo.append(f"--- Página {i} ---\n{texto_pagina.strip()}")

            return "\n\n".join(texto_completo)

        except Exception as e:
            logger.error(f"Error al extraer texto de PDF {ruta_pdf}: {e}")
            raise Exception(f"No pude procesar el documento PDF: {str(e)}")


    @staticmethod
    def procesar_documento(ruta_documento: str) -> str:
        """
        Procesa un documento (PDF o imagen) y extrae su texto.

        Args:
            ruta_documento: Ruta al archivo

        Returns:
            str: Texto extraído

        Raises:
            Exception: Si el archivo no existe o hay error al procesar
        """
        logger.info("ingrese al procesar_documento")
        if not os.path.exists(ruta_documento):
            raise FileNotFoundError(f"El documento no existe: {ruta_documento}")

        extension = Path(ruta_documento).suffix.lower()

        # Procesar según el tipo de archivo
        if extension == '.pdf':
            return DocumentService.extraer_texto_de_pdf(ruta_documento)
        elif extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
            return DocumentService.extraer_texto_de_imagen(ruta_documento)
        else:
            raise ValueError(f"Formato de archivo no soportado: {extension}")

    @staticmethod
    def buscar_en_texto(texto: str, palabra_clave: str) -> Optional[str]:
        """
        Busca una palabra clave en el texto y retorna el contexto relevante.

        Args:
            texto: Texto completo del documento
            palabra_clave: Palabra o frase a buscar

        Returns:
            str con el contexto relevante o None si no encuentra
        """
        if not texto or not palabra_clave:
            return None

        texto_lower = texto.lower()
        palabra_lower = palabra_clave.lower()

        # Buscar la palabra
        indice = texto_lower.find(palabra_lower)

        if indice == -1:
            return None

        # Extraer contexto (300 caracteres antes y después)
        inicio = max(0, indice - 300)
        fin = min(len(texto), indice + len(palabra_clave) + 300)

        contexto = texto[inicio:fin]

        # Agregar "..." si no es el inicio o fin del texto
        if inicio > 0:
            contexto = "..." + contexto
        if fin < len(texto):
            contexto = contexto + "..."

        return contexto.strip()

    @staticmethod
    def construir_ruta_documento(paciente_id: int, nombre_archivo: str, tipo: str = "fichas") -> str:
        """
        Construye la ruta completa a un documento.

        Args:
            paciente_id: ID del paciente
            nombre_archivo: Nombre del archivo
            tipo: Tipo de documento ("fichas" o "documentos")

        Returns:
            str: Ruta completa al archivo
        """
        # Ruta base desde settings
        base_path = Path(settings.uploads_path)

        # Construir ruta: uploads/fichas/{paciente_id}/{nombre_archivo}
        ruta_completa = base_path / tipo / str(paciente_id) / nombre_archivo

        return str(ruta_completa.resolve())

    @staticmethod
    def extraer_informacion_estructurada(texto: str, campos: List[str]) -> Dict[str, Optional[str]]:
        """
        Intenta extraer información estructurada de un documento médico.

        Args:
            texto: Texto del documento
            campos: Lista de campos a buscar (ej: ["peso", "altura", "presión"])

        Returns:
            Dict con los campos encontrados y su valor
        """
        resultado = {}

        for campo in campos:
            # Buscar el campo en el texto
            contexto = DocumentService.buscar_en_texto(texto, campo)
            resultado[campo] = contexto

        return resultado

    @staticmethod
    async def procesar_documentos_paciente(
        documentos: List,
        palabra_clave: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Procesa múltiples documentos de un paciente.

        Args:
            documentos: Lista de objetos Documento de BD
            palabra_clave: Palabra clave opcional para buscar

        Returns:
            Dict con textos extraídos y contextos relevantes
        """
        resultados = {
            "documentos_procesados": 0,
            "errores": [],
            "textos": [],
            "contextos_relevantes": []
        }

        for doc in documentos:
            try:
                # Construir ruta al documento
                tipo_carpeta = "fichas" if doc.tipo.value == "FICHA_MEDICA" else "documentos"
                ruta = DocumentService.construir_ruta_documento(
                    doc.paciente_id,
                    Path(doc.ruta_archivo).name,
                    tipo_carpeta
                )

                # Extraer texto
                texto = DocumentService.procesar_documento(ruta)

                resultados["textos"].append({
                    "documento_id": doc.id,
                    "nombre": doc.nombre,
                    "tipo": doc.tipo.value,
                    "texto": texto[:2000]  # Limitar a 2000 caracteres por documento
                })

                # Si hay palabra clave, buscar contexto
                if palabra_clave:
                    contexto = DocumentService.buscar_en_texto(texto, palabra_clave)
                    if contexto:
                        resultados["contextos_relevantes"].append({
                            "documento": doc.nombre,
                            "contexto": contexto
                        })

                resultados["documentos_procesados"] += 1

            except Exception as e:
                resultados["errores"].append({
                    "documento": doc.nombre,
                    "error": str(e)
                })
                logger.error(f"Error procesando documento {doc.nombre}: {e}")

        return resultados
