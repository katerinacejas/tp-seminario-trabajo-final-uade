import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoMedkitOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoChevronForwardOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import {
  usuariosAPI,
  cuidadoresPacientesAPI,
  citasAPI,
  medicamentosAPI,
} from '../../services/api';
import './HomePatient.css';

export default function HomePaciente() {
  const navigate = useNavigate();
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [pacienteId, setPacienteId] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [medicamentosHoy, setMedicamentosHoy] = useState([]);
  const [cuidadores, setCuidadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del paciente autenticado
      const usuario = await usuariosAPI.getMe();
      setPacienteNombre(usuario.nombreCompleto || 'Paciente');
      setPacienteId(usuario.id);

      // Cargar todas las secciones del día de hoy
      await Promise.all([
        cargarCitasHoy(usuario.id),
        cargarMedicamentosHoy(usuario.id),
        cargarCuidadores(usuario.id),
      ]);
    } catch (err) {
      console.error('Error al cargar datos del home:', err);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para comparar fechas (solo día, mes, año)
  const esMismaFecha = (fecha1, fecha2) => {
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const cargarCitasHoy = async (usuarioId) => {
    try {
      const hoy = new Date();
      const todasLasCitas = await citasAPI.getByPaciente(usuarioId);

      // Filtrar citas de hoy
      const citasDeHoy = todasLasCitas.filter((cita) => {
        if (!cita.fechaHora) return false;
        return esMismaFecha(cita.fechaHora, hoy);
      });

      // Ordenar por hora
      citasDeHoy.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

      setCitasHoy(citasDeHoy);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setCitasHoy([]);
    }
  };

  const cargarMedicamentosHoy = async (usuarioId) => {
    try {
      const hoy = new Date();
      const diaSemanaNombre = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][hoy.getDay()];
      const fechaHoy = hoy.toISOString().split('T')[0];

      const todosMedicamentos = await medicamentosAPI.getByPaciente(
        usuarioId,
        true // Solo activos
      );

      // Filtrar medicamentos que aplican hoy
      const medicamentosHoyTemp = todosMedicamentos.filter((med) => {
        // Verificar que esté en el rango de fechas
        if (med.fechaInicio && fechaHoy < med.fechaInicio) return false;
        if (med.fechaFin && fechaHoy > med.fechaFin) return false;

        // Verificar que tenga horarios para el día de hoy
        if (!med.horarios || med.horarios.length === 0) return false;

        return med.horarios.some((horario) =>
          horario.diasSemana && horario.diasSemana.includes(diaSemanaNombre)
        );
      });

      // Para cada medicamento, filtrar solo los horarios de hoy
      const medicamentosConHorariosHoy = medicamentosHoyTemp.map((med) => ({
        ...med,
        horariosHoy: med.horarios
          .filter((h) => h.diasSemana && h.diasSemana.includes(diaSemanaNombre))
          .sort((a, b) => {
            const timeA = a.hora.split(':').map(Number);
            const timeB = b.hora.split(':').map(Number);
            return timeA[0] - timeB[0] || timeA[1] - timeB[1];
          }),
      }));

      setMedicamentosHoy(medicamentosConHorariosHoy);
    } catch (err) {
      console.error('Error al cargar medicamentos:', err);
      setMedicamentosHoy([]);
    }
  };

  const cargarCuidadores = async (usuarioId) => {
    try {
      const todosCuidadores = await cuidadoresPacientesAPI.getByPaciente(usuarioId);

      // Tomar solo los primeros 3 cuidadores para el home
      const cuidadoresTop3 = (todosCuidadores || []).slice(0, 3);

      setCuidadores(cuidadoresTop3);
    } catch (err) {
      console.error('Error al cargar cuidadores:', err);
      setCuidadores([]);
    }
  };

  const formatearHora = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  const formatearHoraSimple = (horaStr) => {
    if (!horaStr) return '';
    const [horas, minutos] = horaStr.split(':');
    return `${horas}:${minutos}`;
  };

  const formatearFechaHoy = () => {
    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return hoy.toLocaleDateString('es-AR', opciones);
  };

  if (loading) {
    return (
      <div className="home-container">
        <p className="mensaje-loading">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header con saludo personalizado */}
      <div className="home-header-card">
        <h1 className="home-saludo">¡Hola, {pacienteNombre}!</h1>
        <p className="home-fecha">{formatearFechaHoy()}</p>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {/* Sección: Citas médicas de hoy */}
      <div className="home-seccion-card">
        <div className="seccion-header">
          <div className="seccion-header-left">
            <IoCalendarOutline className="seccion-icono" />
            <h2 className="seccion-titulo">Mis citas de hoy</h2>
          </div>
        </div>

        {citasHoy.length === 0 ? (
          <div className="estado-vacio">
            <IoCalendarOutline className="estado-vacio-icono" />
            <p className="estado-vacio-texto">No tienes citas médicas para hoy</p>
          </div>
        ) : (
          <div className="tarjetas-lista">
            {citasHoy.map((cita) => (
              <div
                key={cita.id}
                className="tarjeta-item"
              >
                <div className="tarjeta-hora-badge">
                  <IoTimeOutline />
                  <span>{formatearHora(cita.fechaHora)} hs</span>
                </div>
                <div className="tarjeta-contenido">
                  <h3 className="tarjeta-titulo">Dr. {cita.nombreDoctor}</h3>
                  <p className="tarjeta-subtitulo">{cita.especialidad}</p>
                  {cita.ubicacion && (
                    <p className="tarjeta-detalle">{cita.ubicacion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección: Medicamentos de hoy */}
      <div className="home-seccion-card">
        <div className="seccion-header">
          <div className="seccion-header-left">
            <IoMedkitOutline className="seccion-icono" />
            <h2 className="seccion-titulo">Mis medicamentos de hoy</h2>
          </div>
        </div>

        {medicamentosHoy.length === 0 ? (
          <div className="estado-vacio">
            <IoMedkitOutline className="estado-vacio-icono" />
            <p className="estado-vacio-texto">No tienes medicamentos para hoy</p>
          </div>
        ) : (
          <div className="tarjetas-lista">
            {medicamentosHoy.map((med) => (
              <div
                key={med.id}
                className="tarjeta-item"
              >
                <div className="tarjeta-contenido">
                  <h3 className="tarjeta-titulo">{med.nombre}</h3>
                  <p className="tarjeta-subtitulo">Dosis: {med.dosis}</p>
                  <div className="medicamento-horarios">
                    {med.horariosHoy && med.horariosHoy.map((horario, idx) => (
                      <span key={idx} className="horario-badge">
                        {formatearHoraSimple(horario.hora)}
                      </span>
                    ))}
                  </div>
                  {med.viaAdministracion && (
                    <p className="tarjeta-detalle">Vía: {med.viaAdministracion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección: Mis Cuidadores */}
      <div className="home-seccion-card">
        <div className="seccion-header">
          <div className="seccion-header-left">
            <IoPeopleOutline className="seccion-icono" />
            <h2 className="seccion-titulo">Mis cuidadores</h2>
          </div>
          {cuidadores.length > 0 && (
            <button
              className="btn-ver-mas"
              onClick={() => navigate('/paciente/mis-cuidadores')}
              aria-label="Ver todos los cuidadores"
            >
              <span>Ver todo</span>
              <IoChevronForwardOutline />
            </button>
          )}
        </div>

        {cuidadores.length === 0 ? (
          <div className="estado-vacio">
            <IoPeopleOutline className="estado-vacio-icono" />
            <p className="estado-vacio-texto">No tienes cuidadores asignados</p>
          </div>
        ) : (
          <div className="tarjetas-lista">
            {cuidadores.map((cuidador) => (
              <div
                key={cuidador.id}
                className="tarjeta-item"
                onClick={() => navigate('/paciente/mis-cuidadores')}
              >
                <div className="tarjeta-contenido">
                  <h3 className="tarjeta-titulo">{cuidador.nombreCompleto}</h3>
                  <p className="tarjeta-subtitulo">{cuidador.email}</p>
                  {cuidador.telefono && (
                    <p className="tarjeta-detalle">Tel: {cuidador.telefono}</p>
                  )}
                </div>
                <IoChevronForwardOutline className="tarjeta-icono-nav" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
