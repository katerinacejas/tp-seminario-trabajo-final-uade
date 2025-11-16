import React from "react";
import { fichaEmergencia } from "../../data";
import { usePaciente } from "../../context/PacienteContext";

export default function FichaMedica(){
  // Obtener paciente seleccionado del contexto
  const { pacienteSeleccionado } = usePaciente();
  const pacienteId = pacienteSeleccionado?.id || "p1";
  const f = fichaEmergencia[pacienteId] || fichaEmergencia.p1;
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
          <div>Nombre</div><div>{f.nombre}</div>
          <div>DNI</div><div>{f.dni}</div>
          <div>Nacimiento</div><div>{f.nacimiento}</div>
          <div>Obra social</div><div>{f.obraSocial}</div>
          <div>Alergias</div><div>{f.alergias}</div>
          <div>Diagnósticos</div><div>{f.diagnosticos}</div>
          <div>Medicación</div><div>{f.medicacion}</div>
          <div>Notas</div><div>{f.notas}</div>
        </div>
      </div>

      <h3 style={{marginTop:14}}>Contactos de emergencia</h3>
      <ul className="list">
        {f.contactos.map((c,i)=>(
          <li key={i} className="row">
            <div>
              <div style={{fontWeight:700}}>{c.nombre}</div>
              <small className="muted">{c.tel}</small>
            </div>
            <button className="btn success">Llamar</button>
          </li>
        ))}
      </ul>

      <div className="row" style={{marginTop:12}}>
        <button className="btn danger">Enviar Alerta con mi Ubicación</button>
        <button className="btn">Cerrar</button>
      </div>
    </div>
  );
}
