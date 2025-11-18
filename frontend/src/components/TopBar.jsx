import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoWarning, IoCall } from "react-icons/io5";
import { useAuth } from "../auth";
import { usePaciente } from "../context/PacienteContext";
import { usuariosAPI, contactosEmergenciaAPI } from "../services/api";

export default function TopBar() {
  const { pathname } = useLocation();
  const { isCaregiver, isPatient } = useAuth();
  const { pacientes, pacienteSeleccionado, seleccionarPaciente } = usePaciente();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [contactosEmergencia, setContactosEmergencia] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);

  const title = ({
    "/": "Inicio",
    "/bitacora": "Bitácoras",
    "/recordatorios": "Recordatorios",
    "/tareas": "Lista de Tareas",
    "/docs": "Documentos",
    "/preguntas-frecuentes": "Preguntas Frecuentes",
    "/chatbot": "Chatbot",
    "/perfil": "Perfil",
    "/paciente": "Inicio",
    "/mis-cuidadores": "Mis Cuidadores",
    "/login": "Ingresar",
    "/register": "Crear cuenta",
    "/forgot-password": "Recuperar contraseña",
    "/reset-password": "Actualizar contraseña"
  })[pathname] || "Cuido";

  // Cargar contactos de emergencia cuando se abre el modal
  useEffect(() => {
    if (showEmergencyModal) {
      cargarContactosEmergencia();
    }
  }, [showEmergencyModal, pacienteSeleccionado]);

  const cargarContactosEmergencia = async () => {
    setLoadingContactos(true);
    try {
      let pacienteId;

      if (isPatient) {
        // Si es paciente, obtener su propio ID
        const usuario = await usuariosAPI.getMe();
        pacienteId = usuario.id;
      } else if (isCaregiver && pacienteSeleccionado) {
        // Si es cuidador, usar el paciente seleccionado
        pacienteId = pacienteSeleccionado.id;
      }

      if (pacienteId) {
        const contactos = await contactosEmergenciaAPI.getByPaciente(pacienteId);
        setContactosEmergencia(contactos || []);
      }
    } catch (error) {
      console.error("Error cargando contactos de emergencia:", error);
      setContactosEmergencia([]);
    } finally {
      setLoadingContactos(false);
    }
  };

  const handleLlamarEmergencia = (telefono) => {
    // Limpiar el número de teléfono
    const numeroLimpio = telefono.replace(/\s/g, '');
    window.location.href = `tel:${numeroLimpio}`;
  };

  const handleOpenEmergencyModal = () => {
    // Validar que hay un paciente seleccionado si es cuidador
    if (isCaregiver && !pacienteSeleccionado) {
      alert('Por favor, seleccioná un paciente primero');
      return;
    }
    setShowEmergencyModal(true);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <img className="logo" src="/logo.png" alt="Cuido" />
        <div className="brand-name">Cuido</div>

        {/* Selector de Paciente (solo para cuidadores) */}
        {isCaregiver && pacientes.length > 0 && (
          <>
            <div style={{ marginLeft: 8, color: "#94a3b8" }}>|</div>
            <select
              className="paciente-selector"
              value={pacienteSeleccionado?.id || ''}
              onChange={(e) => seleccionarPaciente(Number(e.target.value))}
              style={{
                marginLeft: 12,
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--bd)',
                background: 'var(--surf-0)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--ink)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.18s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto} {p.edad ? `(${p.edad} años)` : ''}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Botón de Emergencia (PARA CUIDADORES Y PACIENTES) */}
        <button
          onClick={handleOpenEmergencyModal}
          className="btn-emergency"
          style={{
            marginLeft: isCaregiver ? 16 : 'auto',
            padding: '8px 14px',
            background: 'var(--danger-panic)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.18s',
            boxShadow: '0 4px 12px rgba(232, 109, 111, 0.3)',
          }}
        >
          <IoWarning size={18} />
          <span>Emergencia</span>
        </button>
      </div>

      {/* Modal de Contactos de Emergencia */}
      {showEmergencyModal && (
        <div
          onClick={() => setShowEmergencyModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '18px',
              padding: '28px 24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <IoWarning size={36} color="var(--danger-panic)" />
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 12px 0',
              color: 'var(--ink)',
            }}>
              Contactos de emergencia
            </h2>

            <p style={{
              fontSize: '14px',
              textAlign: 'center',
              color: 'var(--muted)',
              margin: '0 0 28px 0',
              lineHeight: 1.6,
            }}>
              {isPatient
                ? 'Llamá a uno de tus contactos inmediatamente'
                : `Contactos de emergencia de ${pacienteSeleccionado?.nombreCompleto || 'paciente'}`
              }
            </p>

            {loadingContactos ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--muted)',
                padding: '32px 0',
              }}>
                Cargando contactos...
              </p>
            ) : contactosEmergencia.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {contactosEmergencia.map((contacto) => (
                  <div
                    key={contacto.id}
                    style={{
                      padding: '16px',
                      background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
                      borderRadius: '12px',
                      border: '1px solid var(--bd)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '15px',
                        color: 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {contacto.nombre}
                        {contacto.esContactoPrincipal && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '999px',
                            fontWeight: 700,
                          }}>
                            Principal
                          </span>
                        )}
                      </div>
                      {contacto.relacion && (
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                          {contacto.relacion}
                        </div>
                      )}
                      <div style={{ fontSize: '14px', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                        {contacto.telefono}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLlamarEmergencia(contacto.telefono)}
                      style={{
                        padding: '12px 18px',
                        background: 'var(--danger-panic)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(232, 109, 111, 0.3)',
                        transition: 'all 0.18s',
                      }}
                    >
                      <IoCall />
                      Llamar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '14px',
                padding: '32px 16px',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '20px',
              }}>
                No hay contactos de emergencia configurados.
                {isPatient && (
                  <>
                    <br />
                    <br />
                    Podés agregarlos desde tu perfil.
                  </>
                )}
              </p>
            )}

            <button
              onClick={() => setShowEmergencyModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
