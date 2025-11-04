// src/pages/PerfilCuidador.jsx
import React from "react";
import { useAuth } from "../../auth";

export default function PerfilCuidador(){
  const { logout } = useAuth();
  return (
    <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>Perfil del cuidador</h2>
      <div className="kv" style={{ marginTop: 8 }}>
        <div>Nombre</div><div>Katerina Cejas</div>
        <div>Teléfono</div><div>+54 11 5555-2222</div>
        <div>Email</div><div>kcejas@cuido.app</div>
        <div>Pacientes</div><div>Ana Pérez (desde 2024), Roberto Sánchez (desde 2025)</div>
      </div>

      <hr />
      <div className="row">
        <button className="btn danger" onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
}
