"""
Constructor de prompts para el chatbot.
"""
from typing import List, Dict, Optional
from models.database_models import Usuario, Paciente, Bitacora, CitaMedica, Medicamento, Tarea
from datetime import datetime


class PromptBuilder:
    """Constructor de prompts contextualizados para el LLM"""

    @staticmethod
    def construir_system_prompt() -> str:
        """
        Construye el system prompt base del chatbot.

        Returns:
            str: System prompt en español
        """
        return (
            "Eres el asistente de Cuido.\n\n"
            "Responde SIEMPRE en español y en TEXTO PLANO.\n"
            "No uses formato markdown: no uses asteriscos, almohadillas (#), "
            "negritas (**texto**), cursivas (*texto*), ni listas con guiones (-) o asteriscos.\n"
            "Escribe tus respuestas como texto normal, con oraciones y párrafos. "
            "Si necesitas enumerar cosas usa por ejemplo: 1), 2), 3).\n\n"
            "Reglas adicionales:\n"
            "1) Si el usuario pide \"descripción completa\" o \"resumen detallado\", "
            "incluye toda la información disponible de forma clara y ordenada.\n"
            "2) Si no hay información sobre algo, responde exactamente: \"No encontré esa información\".\n"
        )

    @staticmethod
    def construir_contexto_paciente(
        usuario: Usuario,
        info_medica: Optional[Paciente] = None
    ) -> str:
        contexto = "\n\nINFORMACIÓN DEL PACIENTE\n"
        contexto += f"Nombre: {usuario.nombre_completo}\n"

        if usuario.fecha_nacimiento:
            edad = (datetime.now().date() - usuario.fecha_nacimiento).days // 365
            contexto += f"Edad: {edad} años\n"

        if info_medica:
            if info_medica.tipo_sanguineo:
                contexto += f"Tipo sanguíneo: {info_medica.tipo_sanguineo}\n"
            if info_medica.peso:
                contexto += f"Peso: {info_medica.peso} kg\n"
            if info_medica.altura:
                contexto += f"Altura: {info_medica.altura} m\n"
            if info_medica.alergias:
                contexto += f"Alergias: {info_medica.alergias}\n"
            if info_medica.condiciones_medicas:
                contexto += f"Condiciones médicas: {info_medica.condiciones_medicas}\n"
            if info_medica.obra_social:
                contexto += f"Obra social: {info_medica.obra_social}\n"

        return contexto

    @staticmethod
    def construir_contexto_medicamentos(medicamentos_con_horarios: List[Dict]) -> str:
        if not medicamentos_con_horarios:
            return "\n\nMEDICAMENTOS\nNo hay medicamentos activos registrados.\n"

        contexto = "\n\nMEDICAMENTOS ACTIVOS\n"

        for item in medicamentos_con_horarios:
            med = item["medicamento"]
            horarios = item["horarios"]

            contexto += f"\nMedicamento: {med.nombre}\n"
            if med.dosis:
                contexto += f"  Dosis: {med.dosis}\n"
            if med.frecuencia:
                contexto += f"  Frecuencia: {med.frecuencia}\n"
            if med.via_administracion:
                contexto += f"  Vía de administración: {med.via_administracion}\n"

            if horarios:
                contexto += "  Horarios:\n"
                for h in horarios:
                    hora_str = h.hora.strftime("%H:%M")
                    dias = h.dias_semana if h.dias_semana else "Todos los días"
                    contexto += f"    {hora_str} ({dias})\n"

            if med.observaciones:
                contexto += f"  Observaciones: {med.observaciones}\n"

        return contexto

    @staticmethod
    def construir_contexto_citas(citas: List[CitaMedica]) -> str:
        if not citas:
            return "\n\nCITAS MÉDICAS\nNo hay citas médicas próximas.\n"

        contexto = "\n\nPRÓXIMAS CITAS MÉDICAS\n"

        for cita in citas:
            fecha_str = cita.fecha_hora.strftime("%d/%m/%Y a las %H:%M")
            contexto += f"\nCita: {fecha_str}\n"

            if cita.nombre_doctor:
                contexto += f"  Médico: {cita.nombre_doctor}\n"
            if cita.especialidad:
                contexto += f"  Especialidad: {cita.especialidad}\n"
            if cita.ubicacion:
                contexto += f"  Ubicación: {cita.ubicacion}\n"
            if cita.motivo:
                contexto += f"  Motivo: {cita.motivo}\n"
            if cita.observaciones:
                contexto += f"  Observaciones: {cita.observaciones}\n"

        return contexto

    @staticmethod
    def construir_contexto_bitacoras(bitacoras: List[Bitacora]) -> str:
        if not bitacoras:
            return "\n\nBITÁCORAS\nNo hay bitácoras registradas.\n"

        contexto = "\n\nBITÁCORAS RECIENTES\n"

        for bitacora in bitacoras:
            fecha_str = bitacora.fecha.strftime("%d/%m/%Y")
            titulo = bitacora.titulo or f"Bitácora del {fecha_str}"
            contexto += f"\nTítulo: {titulo}\n"
            contexto += f"  Fecha: {fecha_str}\n"
            contexto += f"  Descripción: {bitacora.descripcion}\n"
            if bitacora.sintomas:
                contexto += f"  Síntomas: {bitacora.sintomas}\n"
            if bitacora.observaciones:
                contexto += f"  Observaciones: {bitacora.observaciones}\n"

        return contexto

    @staticmethod
    def construir_contexto_tareas(tareas: List[Tarea]) -> str:
        if not tareas:
            return "\n\nTAREAS\nNo hay tareas pendientes.\n"

        contexto = "\n\nTAREAS PENDIENTES\n"

        for tarea in tareas:
            contexto += f"\nTítulo: {tarea.titulo}\n"

            if tarea.descripcion:
                contexto += f"  Descripción: {tarea.descripcion}\n"
            if tarea.fecha_vencimiento:
                venc_str = tarea.fecha_vencimiento.strftime("%d/%m/%Y %H:%M")
                contexto += f"  Vence: {venc_str}\n"
            if tarea.prioridad:
                contexto += f"  Prioridad: {tarea.prioridad.value}\n"

        return contexto

    @staticmethod
    def construir_contexto_lista_documentos(documentos_lista: List[Dict]) -> str:
        if not documentos_lista:
            return "\n\nDOCUMENTOS\nNo hay documentos cargados para este paciente.\n"

        contexto = "\n\nDOCUMENTOS CARGADOS DEL PACIENTE\n"

        for i, doc in enumerate(documentos_lista, start=1):
            nombre = doc.get("nombre", "Sin nombre")
            tipo = doc.get("tipo")
            fecha = doc.get("fecha")
            descripcion = doc.get("descripcion")

            linea = f"{i}) {nombre}"
            if tipo:
                linea += f" ({tipo})"
            if fecha:
                linea += f" - Fecha: {fecha}"
            contexto += linea + "\n"

            if descripcion:
                contexto += f"   Descripción: {descripcion}\n"

        return contexto

    @staticmethod
    def construir_contexto_documentos(resultados_ocr: Dict) -> str:
        if not resultados_ocr or resultados_ocr["documentos_procesados"] == 0:
            return "\n\nDOCUMENTOS (OCR)\nNo se encontraron documentos o no se pudieron procesar.\n"

        contexto = "\n\nINFORMACIÓN EXTRAÍDA DE DOCUMENTOS (OCR)\n"

        if resultados_ocr.get("contextos_relevantes"):
            contexto += "\nResultados relevantes encontrados en los documentos:\n"
            for item in resultados_ocr["contextos_relevantes"]:
                contexto += f"\nDocumento: {item['documento']}\n"
                contexto += f"  Fragmento relevante: {item['contexto']}\n"

        elif resultados_ocr.get("textos"):
            for item in resultados_ocr["textos"][:2]:
                contexto += f"\nDocumento: {item['nombre']} ({item['tipo']})\n"
                contexto += "  Texto extraído (primeros caracteres):\n"
                contexto += item["texto"] + "\n"

        if resultados_ocr.get("errores"):
            contexto += "\nAlgunos documentos no pudieron ser procesados correctamente.\n"

        return contexto

    @staticmethod
    def construir_prompt_completo(
        mensaje_usuario: str,
        contexto_datos: Dict[str, any],
        historial_mensajes: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        system_content = PromptBuilder.construir_system_prompt()

        if contexto_datos.get("usuario"):
            system_content += PromptBuilder.construir_contexto_paciente(
                contexto_datos["usuario"],
                contexto_datos.get("info_medica")
            )

        if contexto_datos.get("medicamentos"):
            system_content += PromptBuilder.construir_contexto_medicamentos(
                contexto_datos["medicamentos"]
            )

        if contexto_datos.get("citas"):
            system_content += PromptBuilder.construir_contexto_citas(
                contexto_datos["citas"]
            )

        if contexto_datos.get("bitacoras"):
            system_content += PromptBuilder.construir_contexto_bitacoras(
                contexto_datos["bitacoras"]
            )

        if contexto_datos.get("tareas"):
            system_content += PromptBuilder.construir_contexto_tareas(
                contexto_datos["tareas"]
            )

        if contexto_datos.get("documentos_lista"):
            system_content += PromptBuilder.construir_contexto_lista_documentos(
                contexto_datos["documentos_lista"]
            )

        if contexto_datos.get("documentos_ocr"):
            system_content += PromptBuilder.construir_contexto_documentos(
                contexto_datos["documentos_ocr"]
            )

        messages = [{"role": "system", "content": system_content}]
        messages.extend(historial_mensajes)
        messages.append({"role": "user", "content": mensaje_usuario})

        return messages
