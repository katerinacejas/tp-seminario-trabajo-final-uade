import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMedkit, IoCalendar, IoDocument, IoPeople } from "react-icons/io5";
import { usuariosAPI, cuidadoresPacientesAPI, recordatoriosAPI, documentosAPI } from "../../services/api";
import "./HomePatient.css";

export default function HomePaciente() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [cuidadores, setCuidadores] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [fichaMedica, setFichaMedica] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener datos del paciente
      const usuarioData = await usuariosAPI.getMe();
      setPaciente(usuarioData);

      // Cargar cuidadores
      await cargarCuidadores(usuarioData.id);

      // Cargar recordatorios de hoy
      await cargarRecordatoriosHoy(usuarioData.id);

      // Cargar ficha médica más reciente
      await cargarFichaMedica(usuarioData.id);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCuidadores = async (usuarioId) => {
    try {
      const data = await cuidadoresPacientesAPI.getByPaciente(usuarioId);
      setCuidadores(data || []);
    } catch (error) {
      console.error("Error cargando cuidadores:", error);
      setCuidadores([]);
    }
  };

  const cargarRecordatoriosHoy = async (usuarioId) => {
    try {
      const hoy = new Date();
      const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];

      const data = await recordatoriosAPI.getDelDia(usuarioId, formatoFecha(hoy));

      // Filtrar solo medicamentos y citas médicas
      const recordatoriosFiltrados = (data || []).filter(r =>
        r.tipo === 'MEDICAMENTO' || r.tipo === 'CITA_MEDICA'
      );

      setRecordatorios(recordatoriosFiltrados);
    } catch (error) {
      console.error("Error cargando recordatorios:", error);
      setRecordatorios([]);
    }
  };

  const cargarFichaMedica = async (usuarioId) => {
    try {
      const fichas = await documentosAPI.getFichasMedicas(usuarioId);

      if (fichas && fichas.length > 0) {
        // Ordenar por fecha de creación descendente y tomar la primera
        const fichaReciente = fichas.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        setFichaMedica(fichaReciente);
      } else {
        setFichaMedica(null);
      }
    } catch (error) {
      console.error("Error cargando ficha médica:", error);
      setFichaMedica(null);
    }
  };

  const descargarFicha = () => {
    if (fichaMedica) {
      const url = documentosAPI.descargar(fichaMedica.id);
      window.open(url, '_blank');
    }
  };

  const formatearHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="home-paciente">
        <div className="welcome-section">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-paciente">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Bienvenidx de nuevo</h1>
        <h1>{paciente?.nombreCompleto || "Paciente"}</h1>
        <p className="subtitle">Acciones rápidas y claras para vos.</p>
      </div>

      {/* Mis Cuidadores */}
      <div className="section-card">
        <div className="section-header">
          <h2>Mis cuidadores</h2>
          <button
            className="link-btn"
            onClick={() => navigate('/paciente/mis-cuidadores')}
          >
            Gestionar cuidadores
          </button>
        </div>

        {cuidadores.length > 0 ? (
          <div className="cuidadores-list">
            {cuidadores.map((cuidador) => (
              <div key={cuidador.id} className="cuidador-item">
                <div className="cuidador-icon">
                  <IoPeople />
                </div>
                <div className="cuidador-info">
                  <p className="nombre">{cuidador.nombreCompleto}</p>
                  <p className="email">{cuidador.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IoPeople />
            </div>
            <p>No tenés cuidadores asignados aún.</p>
            <p>Invitá a alguien para que te ayude.</p>
          </div>
        )}
      </div>

      {/* Recordatorios de hoy */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recordatorios de hoy</h2>
        </div>

        {recordatorios.length > 0 ? (
          <div className="recordatorios-list">
            {recordatorios.map((recordatorio) => (
              <div key={recordatorio.id} className="recordatorio-item">
                <div className={`recordatorio-icon ${recordatorio.tipo === 'CITA_MEDICA' ? 'cita' : ''}`}>
                  {recordatorio.tipo === 'MEDICAMENTO' ? <IoMedkit /> : <IoCalendar />}
                </div>
                <div className="recordatorio-info">
                  <p className="titulo">{recordatorio.descripcion}</p>
                  <p className="hora">{formatearHora(recordatorio.fechaHora)}</p>
                  {recordatorio.observaciones && (
                    <p className="detalles">{recordatorio.observaciones}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IoCalendar />
            </div>
            <p>No hay recordatorios para hoy.</p>
          </div>
        )}
      </div>

      {/* Ficha Médica más reciente */}
      <div className="section-card">
        <div className="section-header">
          <h2>Ficha Médica más reciente</h2>
        </div>

        {fichaMedica ? (
          <div className="ficha-medica-item">
            <div className="ficha-info">
              <p className="nombre">{fichaMedica.nombre}</p>
              <p className="tipo">
                PDF subido el {new Date(fichaMedica.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="ficha-actions">
              <button
                className="icon-btn"
                onClick={descargarFicha}
                title="Ver/Descargar"
              >
                <IoDocument />
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IoDocument />
            </div>
            <p>No hay fichas médicas cargadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
