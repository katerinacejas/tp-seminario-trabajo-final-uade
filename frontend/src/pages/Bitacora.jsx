import React, { useState } from "react";

const sintomasBase = ["Dolor de cabeza","Fiebre","Tos","Cansancio","Náuseas","Mareo"];

export default function Bitacora(){
  const [sintomas, setSintomas] = useState(["Tos"]);
  const [nuevo, setNuevo] = useState("");

  const toggle = (s)=>{
    setSintomas(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  };

  const addSintoma = ()=>{
    const v = nuevo.trim();
    if(!v) return;
    if(!sintomasBase.includes(v)) sintomasBase.push(v);
    setSintomas(prev => prev.includes(v)? prev : [...prev, v]);
    setNuevo("");
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="hero">
          <div className="title"><h1>Bitácora</h1></div>
          <div className="subtitle">Registra síntomas, notas y adjuntos del día.</div>

          <div className="quick-actions">
            <button className="btn pill primary">Guardar registro</button>
            <button className="btn pill">Ver historial</button>
          </div>
        </div>
      </div>

      <div className="col-12 col-6">
        <div className="card">
          <h2>Síntomas de hoy</h2>

          <div className="tags" style={{marginBottom:10}}>
            {sintomasBase.map(s=>(
              <span
                key={s}
                className={`tag ${sintomas.includes(s) ? "active": ""}`}
                onClick={()=>toggle(s)}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="row" style={{gap:10}}>
            <input className="input" placeholder="Agregar síntoma..." value={nuevo} onChange={e=>setNuevo(e.target.value)} />
            <button className="btn">Añadir</button>
            <button className="btn primary" onClick={addSintoma}>Guardar</button>
          </div>
        </div>
      </div>

      <div className="col-12 col-6">
        <div className="card">
          <h2>Notas</h2>
          <textarea rows={6} className="input" placeholder="Escribí observaciones, qué se hizo, evolución, etc." />
          <div className="row" style={{marginTop:10}}>
            <button className="btn">Adjuntar archivo</button>
            <button className="btn primary">Guardar</button>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <h2>Historial</h2>
          <div className="timeline">
            <div className="t-item">
              <div className="t-head">
                <div className="t-date">
                  <div className="day">22</div>
                  <div>
                    <div style={{fontWeight:800}}>2025-10-22</div>
                    <div className="dow">Miércoles</div>
                  </div>
                </div>
                <span className="badge">Por: Katerina Cejas</span>
              </div>
              <div className="t-body">
                <div className="t-section">
                  <h4>Síntomas</h4>
                  <div className="tags">
                    <span className="tag active">Cansancio</span>
                    <span className="tag">Mareo</span>
                  </div>
                </div>
                <div className="t-section">
                  <h4>Notas</h4>
                  <p>Descansó siesta. Se monitoreó presión. Buena hidratación.</p>
                </div>
              </div>
            </div>

            <div className="t-item">
              <div className="t-head">
                <div className="t-date">
                  <div className="day">21</div>
                  <div>
                    <div style={{fontWeight:800}}>2025-10-21</div>
                    <div className="dow">Martes</div>
                  </div>
                </div>
                <span className="badge">Por: S. López</span>
              </div>
              <div className="t-body">
                <div className="t-section">
                  <h4>Síntomas</h4>
                  <div className="tags">
                    <span className="tag active">Fiebre</span>
                    <span className="tag active">Tos</span>
                  </div>
                </div>
                <div className="t-section">
                  <h4>Notas</h4>
                  <p>Mejoró con té y reposo. Control 37.4° a las 22:00.</p>
                </div>
                <div className="t-section">
                  <h4>Adjuntos</h4>
                  <div className="t-files">
                    <span className="t-file">Temp_22hs.png</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="row" style={{marginTop:12}}>
            <button className="btn">Cargar más</button>
          </div>
        </div>
      </div>
    </div>
  );
}
