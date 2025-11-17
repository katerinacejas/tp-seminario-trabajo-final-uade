import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth";
import "./Login.css";
import Feather from '@expo/vector-icons/Feather';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    rol: "cuidador",
    pass: "",
  });

  const [isRolOpen, setIsRolOpen] = useState(false);
  const [showPass, setShowPass] = useState(false); // ← estado para el ojito

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
    // usar el rol desde el estado
    login(form.rol);
    nav(form.rol === "cuidador" ? "/" : "/paciente", { replace: true });
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <header className="login-hero">
          <div className="login-hero-top">
            <span className="login-skip"> </span>
          </div>

          <div className="login-avatar">
            <img src="/logo.png" alt="Cuido" />
          </div>

          <h1 className="login-title">¡Bienvenido/a de nuevo!</h1>
          <p className="login-subtitle">
            Cuidadores y pacientes en un mismo lugar
          </p>
        </header>

        <main className="login-body">
          <form className="login-form" onSubmit={submit}>
            {/* Rol */}
            <div className="register-field">
              <label className="register-label">Rol</label>

              <div
                className={`register-select-wrapper ${
                  isRolOpen ? "open" : ""
                }`}
                onClick={() => setIsRolOpen(!isRolOpen)}
              >
                <span className="register-select-value">
                  {roles.find((r) => r.value === form.rol)?.label ??
                    "Seleccioná un rol"}
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

            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                name="email"
                value={form.email}
                onChange={onChange}
                type="email"
                required
                placeholder="usuario@correo.com"
              />
            </div>

            {/* Contraseña con ojito */}
            <div className="login-field">
              <label className="login-label">Contraseña</label>
              <div className="login-pass-wrapper">
                <input
                  className="login-input login-input-pass"
                  name="pass"
                  value={form.pass}
                  onChange={onChange}
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={
                    showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPass ? <Feather name="eye" size={24} color="black" /> : <Feather name="eye-off" size={24} color="black" />}
                </button>
              </div>
            </div>

            <div className="login-footer">
              <button className="login-btn-primary" type="submit">
                Iniciar sesión
              </button>

              <p className="login-text-small">
                ¿No tenés cuenta?{" "}
                <Link to="/register" className="login-link-strong">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
