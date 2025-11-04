import React from "react";
import { documentos } from "../../data";

export default function Documentos({ pacienteId }){
  const list = documentos.filter(d=>d.paciente===pacienteId);
  return (
    <div className="card">
      <h2>Documentos Médicos</h2>
      <p className="muted">Guardá y organizá recetas, resultados de laboratorio y más.</p>

      <div className="row" style={{marginTop:8}}>
        <button className="btn primary">Subir Documento</button>
      </div>

      <div className="file-list">
        {list.map(d=>(
          <div key={d.id} className="file-item">
            <div className="left">
              <div className="icon">📄</div>
              <div>
                <div style={{fontWeight:700}}>{d.nombre}</div>
                <small>Subido el: {d.fecha}</small>
              </div>
            </div>
            <div className="btn-group">
              <button className="btn">Ver</button>
              <button className="btn danger">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
