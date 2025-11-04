import React from "react";

export default function HomePaciente(){
  return (
    <div className="grid">
      <div className="col-12">
        <div className="hero">
          <div className="title">
            <h1>Hola</h1>
          </div>
          <div className="subtitle">Acciones rápidas y claras para vos.</div>

          <div className="quick-actions">
            <button className="btn pill danger">
              ¡Pánico!
            </button>
            <button className="btn pill primary">Invitar cuidador</button>
            <button className="btn pill">Mis cuidadores</button>
            <button className="btn pill">Ficha de emergencia</button>
            <button className="btn pill">Cerrar sesión</button>
          </div>
        </div>
      </div>

      <div className="col-12 col-6">
        <div className="card">
          <h2>Mis cuidadores</h2>
          <table className="table">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th></tr></thead>
            <tbody>
              <tr><td>Katerina Cejas</td><td>+54 11 5555-1111</td><td>kcejas@cuido.app</td></tr>
              <tr><td>Santiago López</td><td>+54 11 5555-4444</td><td>slopez@cuido.app</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-12 col-6">
        <div className="card">
          <h2>Próximos recordatorios</h2>
          <ul className="list">
            <li className="row"><div><strong>08:00</strong> — Losartán 50mg</div><span className="badge">Activa</span></li>
            <li className="row"><div><strong>20:00</strong> — Atorvastatina 20mg</div><span className="badge">Activa</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
