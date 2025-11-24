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
        return """
			Eres el asistente de Cuido. Responde en español con TODOS los datos disponibles de nuestra base de datos.
			Reglas:
			- Si el usuario pide "descripción completa", incluye TODO lo que tengas
			- Si no hay información, di "No encontré esa información"
		"""

    @staticmethod
    def construir_contexto_paciente(
        usuario: Usuario,
        info_medica: Optional[Paciente] = None
    ) -> str:
        """
        Construye el contexto básico del paciente.

        Args:
            usuario: Usuario (paciente)
            info_medica: Información médica del paciente (opcional)

        Returns:
            str: Contexto del paciente
        """
        contexto = f"\n\n## INFORMACIÓN DEL PACIENTE:\n"
        contexto += f"- **Nombre**: {usuario.nombre_completo}\n"

        if usuario.fecha_nacimiento:
            edad = (datetime.now().date() - usuario.fecha_nacimiento).days // 365
            contexto += f"- **Edad**: {edad} años\n"

        if info_medica:
            if info_medica.tipo_sanguineo:
                contexto += f"- **Tipo Sanguíneo**: {info_medica.tipo_sanguineo}\n"
            if info_medica.peso:
                contexto += f"- **Peso**: {info_medica.peso} kg\n"
            if info_medica.altura:
                contexto += f"- **Altura**: {info_medica.altura} m\n"
            if info_medica.alergias:
                contexto += f"- **Alergias**: {info_medica.alergias}\n"
            if info_medica.condiciones_medicas:
                contexto += f"- **Condiciones Médicas**: {info_medica.condiciones_medicas}\n"
            if info_medica.obra_social:
                contexto += f"- **Obra Social**: {info_medica.obra_social}\n"

        return contexto

    @staticmethod
    def construir_contexto_medicamentos(medicamentos_con_horarios: List[Dict]) -> str:
        """
        Construye el contexto de medicamentos.

        Args:
            medicamentos_con_horarios: Lista de dicts con medicamento y horarios

        Returns:
            str: Contexto de medicamentos
        """
        if not medicamentos_con_horarios:
            return "\n\n## MEDICAMENTOS:\nNo hay medicamentos activos registrados.\n"

        contexto = "\n\n## MEDICAMENTOS ACTIVOS:\n"

        for item in medicamentos_con_horarios:
            med = item["medicamento"]
            horarios = item["horarios"]

            contexto += f"\n### {med.nombre}\n"
            if med.dosis:
                contexto += f"- Dosis: {med.dosis}\n"
            if med.frecuencia:
                contexto += f"- Frecuencia: {med.frecuencia}\n"
            if med.via_administracion:
                contexto += f"- Vía: {med.via_administracion}\n"

            if horarios:
                contexto += f"- Horarios:\n"
                for h in horarios:
                    hora_str = h.hora.strftime("%H:%M")
                    dias = h.dias_semana if h.dias_semana else "Todos los días"
                    contexto += f"  - {hora_str} ({dias})\n"

            if med.observaciones:
                contexto += f"- Observaciones: {med.observaciones}\n"

        return contexto

    @staticmethod
    def construir_contexto_citas(citas: List[CitaMedica]) -> str:
        """
        Construye el contexto de citas médicas.

        Args:
            citas: Lista de CitaMedica

        Returns:
            str: Contexto de citas
        """
        if not citas:
            return "\n\n## CITAS MÉDICAS:\nNo hay citas médicas próximas.\n"

        contexto = "\n\n## PRÓXIMAS CITAS MÉDICAS:\n"

        for cita in citas:
            fecha_str = cita.fecha_hora.strftime("%d/%m/%Y a las %H:%M")
            contexto += f"\n### {fecha_str}\n"

            if cita.nombre_doctor:
                contexto += f"- Doctor/a: {cita.nombre_doctor}\n"
            if cita.especialidad:
                contexto += f"- Especialidad: {cita.especialidad}\n"
            if cita.ubicacion:
                contexto += f"- Ubicación: {cita.ubicacion}\n"
            if cita.motivo:
                contexto += f"- Motivo: {cita.motivo}\n"
            if cita.observaciones:
                contexto += f"- Observaciones: {cita.observaciones}\n"

        return contexto

    @staticmethod
    def construir_contexto_bitacoras(bitacoras: List[Bitacora]) -> str:
        """
        Construye el contexto de bitácoras.

        Args:
            bitacoras: Lista de Bitacora

        Returns:
            str: Contexto de bitácoras
        """
        if not bitacoras:
            return "\n\n## BITÁCORAS:\nNo hay bitácoras.\n"

        contexto = "\n\n## BITÁCORAS RECIENTES:\n"

        for bitacora in bitacoras:
            fecha_str = bitacora.fecha.strftime("%d/%m/%Y")
            contexto += f"\n### {bitacora.titulo or f'Bitácora del {fecha_str}'}\n"
            contexto += f"- Fecha: {fecha_str}\n"
            contexto += f"- Descripción: {bitacora.descripcion}\n"
            if bitacora.sintomas:
                contexto += f"- Síntomas: {bitacora.sintomas}\n"
            if bitacora.observaciones:
                contexto += f"- Observaciones: {bitacora.observaciones}\n"

        return contexto

    @staticmethod
    def construir_contexto_tareas(tareas: List[Tarea]) -> str:
        """
        Construye el contexto de tareas pendientes.

        Args:
            tareas: Lista de Tarea

        Returns:
            str: Contexto de tareas
        """
        if not tareas:
            return "\n\n## TAREAS:\nNo hay tareas pendientes.\n"

        contexto = "\n\n## TAREAS PENDIENTES:\n"

        for tarea in tareas:
            contexto += f"\n### {tarea.titulo}\n"

            if tarea.descripcion:
                contexto += f"- Descripción: {tarea.descripcion}\n"
            if tarea.fecha_vencimiento:
                venc_str = tarea.fecha_vencimiento.strftime("%d/%m/%Y %H:%M")
                contexto += f"- Vence: {venc_str}\n"
            if tarea.prioridad:
                contexto += f"- Prioridad: {tarea.prioridad.value}\n"

        return contexto

    @staticmethod
    def construir_contexto_documentos(resultados_ocr: Dict) -> str:
        """
        Construye el contexto de documentos procesados con OCR.

        Args:
            resultados_ocr: Resultados del procesamiento de documentos

        Returns:
            str: Contexto de documentos
        """
        if not resultados_ocr or resultados_ocr["documentos_procesados"] == 0:
            return "\n\n## DOCUMENTOS:\nNo se encontraron documentos o no se pudieron procesar.\n"

        contexto = "\n\n## INFORMACIÓN DE DOCUMENTOS:\n"

        # Si hay contextos relevantes (búsqueda específica)
        if resultados_ocr.get("contextos_relevantes"):
            contexto += "\n### Información encontrada:\n"
            for item in resultados_ocr["contextos_relevantes"]:
                contexto += f"\n**{item['documento']}**:\n{item['contexto']}\n"

        # Textos completos (limitados)
        elif resultados_ocr.get("textos"):
            for item in resultados_ocr["textos"][:2]:  # Máximo 2 documentos completos
                contexto += f"\n### {item['nombre']} ({item['tipo']})\n"
                contexto += f"{item['texto']}\n"

        # Errores
        if resultados_ocr.get("errores"):
            contexto += "\n\n**Nota**: Algunos documentos no pudieron ser procesados.\n"

        return contexto

    @staticmethod
    def construir_prompt_completo(
        mensaje_usuario: str,
        contexto_datos: Dict[str, any],
        historial_mensajes: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        """
        Construye el prompt completo con system, contexto, historial y mensaje actual.

        Args:
            mensaje_usuario: Mensaje actual del usuario
            contexto_datos: Dict con todos los datos contextuales
            historial_mensajes: Historial de mensajes previos

        Returns:
            Lista de mensajes en formato OpenAI
        """
        # System prompt
        system_content = PromptBuilder.construir_system_prompt()

        # Agregar contextos relevantes
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

        if contexto_datos.get("documentos_ocr"):
            system_content += PromptBuilder.construir_contexto_documentos(
                contexto_datos["documentos_ocr"]
            )

        # Construir lista de mensajes
        messages = [{"role": "system", "content": system_content}]

        # Agregar historial
        messages.extend(historial_mensajes)

        # Agregar mensaje actual
        messages.append({"role": "user", "content": mensaje_usuario})

        return messages
