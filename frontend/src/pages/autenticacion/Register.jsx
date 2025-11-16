import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    rol: "cuidador",
    email: "",
    pass: "",
    pass2: "",
  });

  const [isRolOpen, setIsRolOpen] = useState(false);

  const roles = [
    { value: "cuidador", label: "Cuidador" },
    { value: "paciente", label: "Paciente" },
  ];

  const onChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const submit = (e) => {
    e.preventDefault();
    if (form.pass !== form.pass2) {
      alert("Las contraseñas no coinciden");
      return;
    }
    nav("/login", { replace: true });
  };

  return (
    <div className="register-screen">
      <div className="register-card">
        <header className="register-hero">
          <button
            type="button"
            className="register-back"
            onClick={() => nav(-1)}
          >
            ←
          </button>

          <div className="register-avatar">
            <img src="/logo.png" alt="Cuido" />
          </div>

          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            Es gratis y te toma menos de un minuto
          </p>
        </header>

        <main className="register-body">
          <form className="register-form" onSubmit={submit}>
            <div className="register-field">
              <label className="register-label">Nombre y apellido</label>
              <input
                className="register-input"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej: Ana Pérez"
                required
              />
            </div>

            <div className="register-field">
              <label className="register-label">Rol</label>

              <div
                className={`register-select-wrapper ${
                  isRolOpen ? "open" : ""
                }`}
                onClick={() => setIsRolOpen(!isRolOpen)}
              >
                <span className="register-select-value">
                  {
                    roles.find((r) => r.value === form.rol)?.label ??
                    "Seleccioná un rol"
                  }
                </span>
                <span className="register-select-arrow">⌵</span>
              </div>

              {isRolOpen && (
                <ul className="register-select-menu">
                  {roles.map((option) => (
                    <li
                      key={option.value}
                      className={`register-select-option ${
                        option.value === form.rol ? "selected" : ""
                      }`}
                      onClick={() => {
                        setForm({ ...form, rol: option.value });
                        setIsRolOpen(false);
                      }}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="register-field">
              <label className="register-label">Email</label>
              <input
                className="register-input"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="usuario@correo.com"
                required
              />
            </div>

            <div className="register-field">
              <label className="register-label">Contraseña</label>
              <input
                className="register-input"
                name="pass"
                type="password"
                value={form.pass}
                onChange={onChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="register-field">
              <label className="register-label">Repetir contraseña</label>
              <input
                className="register-input"
                name="pass2"
                type="password"
                value={form.pass2}
                onChange={onChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="register-footer">
              <button className="register-btn-primary" type="submit">
                Registrarme
              </button>

              <p className="register-text-small">
                ¿Ya tenés cuenta?{" "}
                <Link to="/login" className="register-link-strong">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
