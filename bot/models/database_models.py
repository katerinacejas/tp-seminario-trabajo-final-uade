"""
Modelos SQLAlchemy para lectura de datos de MySQL.
Estos modelos son READ-ONLY para el microservicio de chatbot.
"""
from sqlalchemy import Column, BigInteger, String, Text, Date, DateTime, Boolean, Enum, DECIMAL, Time, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from config.database import Base
import enum


class RolEnum(str, enum.Enum):
    """Enum para roles de usuario"""
    CUIDADOR = "CUIDADOR"
    PACIENTE = "PACIENTE"
    ADMIN = "ADMIN"


class TipoDocumentoEnum(str, enum.Enum):
    """Enum para tipos de documento"""
    FICHA_MEDICA = "FICHA_MEDICA"
    ESTUDIO = "ESTUDIO"
    RECETA = "RECETA"
    OTRO = "OTRO"


class CategoriaArchivoEnum(str, enum.Enum):
    """Enum para categoría de archivo"""
    DOCUMENTO = "DOCUMENTO"
    IMAGEN = "IMAGEN"
    VIDEO = "VIDEO"


class EstadoVinculacionEnum(str, enum.Enum):
    """Enum para estado de vinculación cuidador-paciente"""
    PENDIENTE = "PENDIENTE"
    ACEPTADO = "ACEPTADO"
    RECHAZADO = "RECHAZADO"


class PrioridadEnum(str, enum.Enum):
    """Enum para prioridad de tareas"""
    BAJA = "BAJA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"


class Usuario(Base):
    """Modelo de Usuario"""
    __tablename__ = "usuarios"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    nombre_completo = Column(String(255), nullable=False)
    direccion = Column(String(255))
    telefono = Column(String(20))
    fecha_nacimiento = Column(Date)
    avatar = Column(String(500))
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    rol = Column(Enum(RolEnum), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Paciente(Base):
    """Modelo de Paciente (información médica)"""
    __tablename__ = "pacientes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), unique=True, nullable=False)
    tipo_sanguineo = Column(String(10))
    peso = Column(DECIMAL(5, 2))
    altura = Column(DECIMAL(5, 2))
    alergias = Column(Text)
    condiciones_medicas = Column(Text)  # JSON array
    notas_importantes = Column(Text)    # JSON array
    obra_social = Column(String(255))
    numero_afiliado = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CuidadorPaciente(Base):
    """Modelo de vinculación Cuidador-Paciente"""
    __tablename__ = "cuidadores_pacientes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    cuidador_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    es_principal = Column(Boolean, default=False)
    estado = Column(Enum(EstadoVinculacionEnum), default=EstadoVinculacionEnum.PENDIENTE)
    fecha_invitacion = Column(DateTime, default=datetime.utcnow)
    fecha_aceptacion = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContactoEmergencia(Base):
    """Modelo de Contacto de Emergencia"""
    __tablename__ = "contactos_emergencia"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    relacion = Column(String(100))
    telefono = Column(String(20), nullable=False)
    email = Column(String(255))
    es_contacto_principal = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Bitacora(Base):
    """Modelo de Bitácora"""
    __tablename__ = "bitacoras"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    cuidador_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    sintomas = Column(String(500))  # Opcional
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CitaMedica(Base):
    """Modelo de Cita Médica"""
    __tablename__ = "citas_medicas"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    cuidador_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    ubicacion = Column(String(255))
    nombre_doctor = Column(String(255))
    especialidad = Column(String(100))
    motivo = Column(Text)
    observaciones = Column(Text)
    recordatorio_enviado = Column(Boolean, default=False)
    completada = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Medicamento(Base):
    """Modelo de Medicamento"""
    __tablename__ = "medicamentos"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    cuidador_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    dosis = Column(String(100))
    frecuencia = Column(String(100))
    via_administracion = Column(String(100))
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    activo = Column(Boolean, default=True)
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HorarioMedicamento(Base):
    """Modelo de Horario de Medicamento"""
    __tablename__ = "horarios_medicamento"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    medicamento_id = Column(BigInteger, ForeignKey("medicamentos.id"), nullable=False)
    hora = Column(Time, nullable=False)
    dias_semana = Column(String(50))  # JSON: ["L","M","X","J","V","S","D"]
    created_at = Column(DateTime, default=datetime.utcnow)


class Tarea(Base):
    """Modelo de Tarea"""
    __tablename__ = "tareas"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    cuidador_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    fecha_vencimiento = Column(DateTime)
    prioridad = Column(Enum(PrioridadEnum), default=PrioridadEnum.MEDIA)
    completada = Column(Boolean, default=False)
    fecha_completada = Column(DateTime)
    orden_manual = Column(BigInteger, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Documento(Base):
    """Modelo de Documento"""
    __tablename__ = "documentos"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    cuidador_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoDocumentoEnum), nullable=False)
    ruta_archivo = Column(String(500), nullable=False)  # Antes era "url"
    categoria_archivo = Column(Enum(CategoriaArchivoEnum))
    size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    descripcion = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ConversacionChatbot(Base):
    """Modelo de Conversación del Chatbot"""
    __tablename__ = "conversaciones_chatbot"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    paciente_id = Column(BigInteger, ForeignKey("usuarios.id"))
    mensaje = Column(Text, nullable=False)
    respuesta = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
