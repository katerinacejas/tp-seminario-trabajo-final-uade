"""
Servicio de consultas a la base de datos.
Obtiene información de bitácoras, citas, medicamentos, tareas, etc.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from models.database_models import (
    Bitacora, CitaMedica, Medicamento, HorarioMedicamento,
    Tarea, Documento, ContactoEmergencia, Paciente, Usuario, TipoDocumentoEnum
)
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta


class DataService:
    """Servicio para consultar datos de pacientes"""

    @staticmethod
    async def obtener_bitacoras_recientes(
        db: AsyncSession,
        paciente_id: int,
        limit: int = 3
    ) -> List[Bitacora]:
        """
        Obtiene las bitácoras más recientes de un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente
            limit: Cantidad máxima de bitácoras a retornar

        Returns:
            Lista de Bitacora
        """
        query = (
            select(Bitacora)
            .where(Bitacora.paciente_id == paciente_id)
            .order_by(desc(Bitacora.fecha))
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def obtener_citas_proximas(
        db: AsyncSession,
        paciente_id: int,
        limit: int = 3
    ) -> List[CitaMedica]:
        """
        Obtiene las próximas citas médicas de un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente
            limit: Cantidad máxima de citas a retornar

        Returns:
            Lista de CitaMedica
        """
        ahora = datetime.now()
        query = (
            select(CitaMedica)
            .where(
                and_(
                    CitaMedica.paciente_id == paciente_id,
                    CitaMedica.fecha_hora >= ahora,
                    CitaMedica.completada == False
                )
            )
            .order_by(CitaMedica.fecha_hora)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def obtener_citas_hoy(
        db: AsyncSession,
        paciente_id: int
    ) -> List[CitaMedica]:
        """
        Obtiene las citas médicas de hoy para un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente

        Returns:
            Lista de CitaMedica
        """
        hoy_inicio = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        hoy_fin = hoy_inicio + timedelta(days=1)

        query = select(CitaMedica).where(
            and_(
                CitaMedica.paciente_id == paciente_id,
                CitaMedica.fecha_hora >= hoy_inicio,
                CitaMedica.fecha_hora < hoy_fin,
                CitaMedica.completada == False
            )
        ).order_by(CitaMedica.fecha_hora)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def obtener_medicamentos_activos(
        db: AsyncSession,
        paciente_id: int
    ) -> List[Dict[str, Any]]:
        """
        Obtiene los medicamentos activos de un paciente con sus horarios.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente

        Returns:
            Lista de diccionarios con medicamento y sus horarios
        """
        query = select(Medicamento).where(
            and_(
                Medicamento.paciente_id == paciente_id,
                Medicamento.activo == True
            )
        ).order_by(Medicamento.nombre)

        result = await db.execute(query)
        medicamentos = result.scalars().all()

        # Obtener horarios para cada medicamento
        medicamentos_con_horarios = []
        for med in medicamentos:
            query_horarios = select(HorarioMedicamento).where(
                HorarioMedicamento.medicamento_id == med.id
            ).order_by(HorarioMedicamento.hora)

            result_horarios = await db.execute(query_horarios)
            horarios = result_horarios.scalars().all()

            medicamentos_con_horarios.append({
                "medicamento": med,
                "horarios": horarios
            })

        return medicamentos_con_horarios

    @staticmethod
    async def obtener_tareas_pendientes(
        db: AsyncSession,
        paciente_id: int,
        limit: int = 3
    ) -> List[Tarea]:
        """
        Obtiene las tareas pendientes de un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente
            limit: Cantidad máxima de tareas a retornar

        Returns:
            Lista de Tarea
        """
        # MySQL no soporta NULLS FIRST, usar orden manual en su lugar
        query = (
            select(Tarea)
            .where(
                and_(
                    Tarea.paciente_id == paciente_id,
                    Tarea.completada == False
                )
            )
            .order_by(Tarea.orden_manual.asc(), desc(Tarea.prioridad))
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def obtener_documentos_paciente(
        db: AsyncSession,
        paciente_id: int,
        tipo: Optional[TipoDocumentoEnum] = None
    ) -> List[Documento]:
        """
        Obtiene los documentos de un paciente, opcionalmente filtrados por tipo.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente
            tipo: Tipo de documento (opcional)

        Returns:
            Lista de Documento
        """
        if tipo:
            query = select(Documento).where(
                and_(
                    Documento.paciente_id == paciente_id,
                    Documento.tipo == tipo
                )
            ).order_by(desc(Documento.created_at))
        else:
            query = select(Documento).where(
                Documento.paciente_id == paciente_id
            ).order_by(desc(Documento.created_at))

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def obtener_contactos_emergencia(
        db: AsyncSession,
        paciente_id: int
    ) -> List[ContactoEmergencia]:
        """
        Obtiene los contactos de emergencia de un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente

        Returns:
            Lista de ContactoEmergencia
        """
        query = (
            select(ContactoEmergencia)
            .where(ContactoEmergencia.paciente_id == paciente_id)
            .order_by(desc(ContactoEmergencia.es_contacto_principal))
        )
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def obtener_info_completa_paciente(
        db: AsyncSession,
        paciente_id: int
    ) -> Dict[str, Any]:
        """
        Obtiene toda la información relevante de un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente

        Returns:
            Diccionario con toda la información del paciente
        """
        # Usuario básico
        usuario_query = select(Usuario).where(Usuario.id == paciente_id)
        usuario_result = await db.execute(usuario_query)
        usuario = usuario_result.scalar_one_or_none()

        if not usuario:
            return {}

        # Información médica
        paciente_query = select(Paciente).where(Paciente.usuario_id == paciente_id)
        paciente_result = await db.execute(paciente_query)
        paciente = paciente_result.scalar_one_or_none()

        return {
            "usuario": usuario,
            "info_medica": paciente,
            "bitacoras": await DataService.obtener_bitacoras_recientes(db, paciente_id),
            "citas": await DataService.obtener_citas_proximas(db, paciente_id),
            "medicamentos": await DataService.obtener_medicamentos_activos(db, paciente_id),
            "tareas": await DataService.obtener_tareas_pendientes(db, paciente_id),
            "contactos": await DataService.obtener_contactos_emergencia(db, paciente_id)
        }

    @staticmethod
    def detectar_intencion(mensaje: str) -> List[str]:
        """
        Detecta la intención del usuario basándose en palabras clave.

        Args:
            mensaje: Mensaje del usuario

        Returns:
            Lista de intenciones detectadas
        """
        mensaje_lower = mensaje.lower()
        intenciones = []

        # Medicamentos
        if any(palabra in mensaje_lower for palabra in ["medicamento", "medicina", "pastilla", "dosis", "tomar", "medicamentos"]):
            intenciones.append("medicamentos")

        # Citas médicas
        if any(palabra in mensaje_lower for palabra in ["cita", "doctor", "médico", "médica", "consulta", "turno", "citas", "turnos"]):
            intenciones.append("citas")

        # Bitácoras
        if any(palabra in mensaje_lower for palabra in ["bitácora", "bitacora", "registro", "reporte", "anotación", "resumen", "sintomas", "sintoma", "sintió", "sintio"]):
            intenciones.append("bitacoras")

        # Tareas
        if any(palabra in mensaje_lower for palabra in ["tarea", "pendiente", "hacer", "to-do", "todo", "tareas"]):
            intenciones.append("tareas")

        # Documentos/Fichas
        if any(palabra in mensaje_lower for palabra in ["ficha", "radiografia", "documento", "archivo", "análisis", "estudio", "receta", "documentos"]):
            intenciones.append("documentos")

        # Contactos de emergencia
        if any(palabra in mensaje_lower for palabra in ["contacto", "emergencia", "llamar", "teléfono", "número", "contactos", "numeros", "números"]):
            intenciones.append("contactos")

        # Información del paciente
        if any(palabra in mensaje_lower for palabra in ["información", "datos", "paciente", "alergia", "condición", "enfermedad", "dato", "alergias", "condiciones"]):
            intenciones.append("info_paciente")

        # Si no detectó ninguna intención, asumir consulta general
        if not intenciones:
            intenciones.append("general")

        return intenciones
