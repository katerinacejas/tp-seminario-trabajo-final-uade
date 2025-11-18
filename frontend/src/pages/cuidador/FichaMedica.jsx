import React, { useState, useEffect } from "react";
import { usePaciente } from "../../context/PacienteContext";
import { contactosEmergenciaAPI } from "../../services/api";

export default function FichaMedica(){
  // Obtener paciente seleccionado del contexto
  const { pacienteSeleccionado } = usePaciente();
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pacienteSeleccionado?.id) {
      cargarContactos();
    }
  }, [pacienteSeleccionado?.id]);

  const cargarContactos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactosEmergenciaAPI.getByPaciente(pacienteSeleccionado.id);
      setContactos(data);
    } catch (err) {
      console.error('Error al cargar contactos de emergencia:', err);
      setError('Error al cargar contactos de emergencia');
      setContactos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!pacienteSeleccionado) {
    return (
      <div className="card">
        <p>No hay paciente seleccionado</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="alert-head">
        <div className="badge-icon">⚠️</div>
        <div>
          <h2 style={{margin:0}}>Ficha Médica de Emergencia</h2>
          <small className="muted">Información vital y contactos rápidos.</small>
        </div>
      </div>

      <div className="alert-box">
        <strong>Información del paciente</strong>
        <div className="kv" style={{marginTop:8}}>
          <div>Nombre</div><div>{pacienteSeleccionado.nombreCompleto || 'N/A'}</div>
          <div>DNI</div><div>{pacienteSeleccionado.dni || 'N/A'}</div>
          <div>Nacimiento</div><div>{formatearFecha(pacienteSeleccionado.fechaNacimiento)}</div>
          <div>Obra social</div><div>{pacienteSeleccionado.obraSocial || 'N/A'}</div>
          <div>Alergias</div><div>{pacienteSeleccionado.alergias || 'Ninguna registrada'}</div>
          <div>Diagnósticos</div><div>{pacienteSeleccionado.diagnosticos || 'N/A'}</div>
          <div>Medicación</div><div>{pacienteSeleccionado.medicacionActual || 'N/A'}</div>
          <div>Notas</div><div>{pacienteSeleccionado.observaciones || 'N/A'}</div>
        </div>
      </div>

      <h3 style={{marginTop:14}}>Contactos de emergencia</h3>

      {loading && <p>Cargando contactos...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}

      {!loading && contactos.length === 0 && (
        <p>No hay contactos de emergencia registrados</p>
      )}

      {!loading && contactos.length > 0 && (
        <ul className="list">
          {contactos.map((c) => (
            <li key={c.id} className="row">
              <div>
                <div style={{fontWeight:700}}>
                  {c.nombre}
                  {c.esContactoPrincipal && <span style={{marginLeft:8, fontSize:'0.8rem', color:'#0f6be0'}}>★ Principal</span>}
                </div>
                <small className="muted">{c.telefono}</small>
                {c.relacion && <small className="muted"> - {c.relacion}</small>}
              </div>
              <button className="btn success" onClick={() => window.location.href = `tel:${c.telefono}`}>
                Llamar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="row" style={{marginTop:12}}>
        <button className="btn danger">Enviar Alerta con mi Ubicación</button>
        <button className="btn">Cerrar</button>
      </div>
    </div>
  );
}
