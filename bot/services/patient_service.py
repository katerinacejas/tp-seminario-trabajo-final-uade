"""
Servicio de búsqueda y validación de pacientes.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from models.database_models import Usuario, Paciente, CuidadorPaciente, RolEnum, EstadoVinculacionEnum
from typing import Optional, Tuple
import re


class PatientService:
    """Servicio para gestionar operaciones relacionadas con pacientes"""

    @staticmethod
    async def buscar_paciente_por_nombre(
        db: AsyncSession,
        nombre: str,
        cuidador_id: int
    ) -> Optional[Usuario]:
        """
        Busca un paciente por nombre y verifica que el cuidador tenga acceso.

        Args:
            db: Sesión de base de datos
            nombre: Nombre del paciente a buscar (parcial o completo)
            cuidador_id: ID del cuidador que hace la búsqueda

        Returns:
            Usuario si lo encuentra y tiene acceso, None en caso contrario
        """
        # Buscar usuario con rol PACIENTE que coincida con el nombre
        query = select(Usuario).where(
            and_(
                Usuario.rol == RolEnum.PACIENTE,
                Usuario.nombre_completo.ilike(f"%{nombre}%")
            )
        )
        result = await db.execute(query)
        pacientes = result.scalars().all()

        # Si no hay resultados, retornar None
        if not pacientes:
            return None

        # Si hay múltiples resultados, intentar match exacto primero
        if len(pacientes) > 1:
            for paciente in pacientes:
                if paciente.nombre_completo.lower() == nombre.lower():
                    # Verificar acceso
                    if await PatientService.verificar_acceso_cuidador(db, cuidador_id, paciente.id):
                        return paciente

        # Si no hay match exacto o solo hay uno, verificar acceso del primero
        paciente = pacientes[0]
        if await PatientService.verificar_acceso_cuidador(db, cuidador_id, paciente.id):
            return paciente

        return None

    @staticmethod
    async def verificar_acceso_cuidador(
        db: AsyncSession,
        cuidador_id: int,
        paciente_id: int
    ) -> bool:
        """
        Verifica si un cuidador tiene acceso a un paciente específico.

        Args:
            db: Sesión de base de datos
            cuidador_id: ID del cuidador
            paciente_id: ID del paciente

        Returns:
            bool: True si tiene acceso, False en caso contrario
        """
        query = select(CuidadorPaciente).where(
            and_(
                CuidadorPaciente.cuidador_id == cuidador_id,
                CuidadorPaciente.paciente_id == paciente_id,
                CuidadorPaciente.estado == EstadoVinculacionEnum.ACEPTADO
            )
        )
        result = await db.execute(query)
        vinculacion = result.scalar_one_or_none()

        return vinculacion is not None

    @staticmethod
    async def obtener_paciente_por_id(
        db: AsyncSession,
        paciente_id: int
    ) -> Optional[Usuario]:
        """
        Obtiene un paciente por su ID.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente

        Returns:
            Usuario o None si no existe
        """
        result = await db.execute(
            select(Usuario).where(
                and_(
                    Usuario.id == paciente_id,
                    Usuario.rol == RolEnum.PACIENTE
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def obtener_info_medica_paciente(
        db: AsyncSession,
        paciente_id: int
    ) -> Optional[Paciente]:
        """
        Obtiene la información médica detallada de un paciente.

        Args:
            db: Sesión de base de datos
            paciente_id: ID del paciente (usuario_id en tabla pacientes)

        Returns:
            Paciente o None si no existe
        """
        result = await db.execute(
            select(Paciente).where(Paciente.usuario_id == paciente_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    def detectar_nombre_paciente_en_mensaje(mensaje: str) -> Optional[str]:
        """
        Intenta detectar si el mensaje menciona un nombre de paciente.
        Busca patrones como: "del paciente Juan", "de María", "para Pedro", etc.

        Args:
            mensaje: Mensaje del usuario

        Returns:
            str con el nombre detectado o None
        """
        # MEJORADO: Patrones MÁS ESTRICTOS para evitar falsos positivos
        # Solo detecta cuando hay contexto claro de "paciente"
        patrones = [
            r"(?:del paciente |de la paciente |para el paciente |sobre el paciente )((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s?)+)",
            r"(?:mi paciente |el paciente |la paciente )((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s?)+)",
        ]

        for patron in patrones:
            match = re.search(patron, mensaje, re.IGNORECASE)
            if match:
                nombre = match.group(1).strip()
                # Verificar que sea un nombre válido (mínimo 3 caracteres, máximo 3 palabras)
                palabras = nombre.split()
                if len(nombre) >= 3 and len(palabras) <= 3:
                    return nombre

        return None

    @staticmethod
    async def resolver_paciente_desde_mensaje(
        db: AsyncSession,
        mensaje: str,
        paciente_id_default: int,
        cuidador_id: int
    ) -> Tuple[Optional[Usuario], str]:
        """
        Resuelve qué paciente se está mencionando en el mensaje.
        Sigue la lógica: detectar nombre → verificar acceso → usar default.

        Args:
            db: Sesión de base de datos
            mensaje: Mensaje del usuario
            paciente_id_default: ID del paciente seleccionado globalmente
            cuidador_id: ID del cuidador

        Returns:
            Tuple[Usuario, str]: (paciente, mensaje_error)
            Si mensaje_error es None, el paciente es válido
        """
        # 1. Detectar si menciona un nombre específico
        nombre_detectado = PatientService.detectar_nombre_paciente_en_mensaje(mensaje)

        if nombre_detectado:
            # 2. Buscar paciente por nombre y verificar acceso
            paciente = await PatientService.buscar_paciente_por_nombre(
                db, nombre_detectado, cuidador_id
            )

            if paciente:
                # Si lo encontró y tiene acceso, usar ese paciente
                return paciente, None
            else:
                # No lo encontró o no tiene acceso
                return None, f"No encontré información del paciente '{nombre_detectado}'. Verifica el nombre o tus permisos."

        # 3. No mencionó nombre específico, usar paciente por defecto
        # Verificar que el cuidador tenga acceso al paciente default
        tiene_acceso = await PatientService.verificar_acceso_cuidador(
            db, cuidador_id, paciente_id_default
        )

        if not tiene_acceso:
            return None, "No tienes acceso al paciente seleccionado."

        # Obtener el paciente default
        paciente = await PatientService.obtener_paciente_por_id(db, paciente_id_default)

        if not paciente:
            return None, "El paciente seleccionado no existe."

        return paciente, None
