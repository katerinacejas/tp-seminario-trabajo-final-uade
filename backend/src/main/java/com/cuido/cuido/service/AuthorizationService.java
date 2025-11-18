package com.cuido.cuido.service;

import com.cuido.cuido.exception.AccessDeniedException;
import com.cuido.cuido.model.CuidadorPaciente;
import com.cuido.cuido.model.Rol;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.CuidadorPacienteRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio de autorización para validar permisos de acceso
 */
@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthorizationService.class);

    private final UsuarioRepository usuarioRepository;
    private final CuidadorPacienteRepository cuidadorPacienteRepository;

    /**
     * Obtiene el usuario autenticado actualmente
     */
    public Usuario getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("No hay usuario autenticado");
        }

        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Usuario no encontrado"));
    }

    /**
     * Verifica si el usuario autenticado es el propio paciente
     */
    public boolean esElMismoPaciente(Long pacienteId) {
        Usuario usuario = getUsuarioAutenticado();
        return usuario.getRol() == Rol.PACIENTE && usuario.getId().equals(pacienteId);
    }

    /**
     * Verifica si el usuario autenticado es un cuidador autorizado del paciente
     */
    public boolean esCuidadorAutorizado(Long pacienteId) {
        Usuario usuario = getUsuarioAutenticado();

        if (usuario.getRol() != Rol.CUIDADOR) {
            return false;
        }

        // Buscar relación activa entre el cuidador y el paciente
        Optional<CuidadorPaciente> relacion = cuidadorPacienteRepository
                .findByCuidadorIdAndPacienteId(usuario.getId(), pacienteId);

        return relacion.isPresent() &&
               relacion.get().getEstado() == CuidadorPaciente.EstadoRelacion.ACEPTADO;
    }

    /**
     * Verifica si el usuario tiene acceso a los datos del paciente
     * (ya sea porque es el propio paciente o es su cuidador autorizado)
     */
    public boolean tieneAccesoAPaciente(Long pacienteId) {
        return esElMismoPaciente(pacienteId) || esCuidadorAutorizado(pacienteId);
    }

    /**
     * Valida que el usuario tenga acceso al paciente, lanza excepción si no
     */
    public void validarAccesoAPaciente(Long pacienteId) {
        if (!tieneAccesoAPaciente(pacienteId)) {
            Usuario usuario = getUsuarioAutenticado();
            logger.warn("SECURITY: Usuario ID {} (Rol: {}) intentó acceder a datos del paciente ID {} sin autorización",
                       usuario.getId(), usuario.getRol(), pacienteId);
            throw new AccessDeniedException(
                "No tienes permisos para acceder a los datos de este paciente"
            );
        }
        logger.debug("Acceso autorizado al paciente ID: {}", pacienteId);
    }

    /**
     * Valida que el usuario sea un cuidador autorizado
     */
    public void validarEsCuidadorAutorizado(Long pacienteId) {
        if (!esCuidadorAutorizado(pacienteId)) {
            Usuario usuario = getUsuarioAutenticado();
            logger.warn("SECURITY: Usuario ID {} (Rol: {}) intentó realizar acción de cuidador sin autorización para paciente ID {}",
                       usuario.getId(), usuario.getRol(), pacienteId);
            throw new AccessDeniedException(
                "Solo cuidadores autorizados pueden realizar esta acción"
            );
        }
    }

    /**
     * Valida que el usuario sea el propio paciente
     */
    public void validarEsPropietario(Long pacienteId) {
        if (!esElMismoPaciente(pacienteId)) {
            Usuario usuario = getUsuarioAutenticado();
            logger.warn("SECURITY: Usuario ID {} (Rol: {}) intentó realizar acción exclusiva del paciente ID {}",
                       usuario.getId(), usuario.getRol(), pacienteId);
            throw new AccessDeniedException(
                "Solo el paciente puede realizar esta acción"
            );
        }
    }

    /**
     * Obtiene el ID del paciente desde el contexto de seguridad
     * Si el usuario es PACIENTE, retorna su propio ID
     * Si el usuario es CUIDADOR, debe especificar el pacienteId
     */
    public Long obtenerPacienteIdDesdeContexto(Long pacienteIdParam) {
        Usuario usuario = getUsuarioAutenticado();

        if (usuario.getRol() == Rol.PACIENTE) {
            // Si es paciente, siempre usa su propio ID
            return usuario.getId();
        } else if (usuario.getRol() == Rol.CUIDADOR) {
            // Si es cuidador, debe proporcionar el ID del paciente
            if (pacienteIdParam == null) {
                throw new AccessDeniedException(
                    "Los cuidadores deben especificar el ID del paciente"
                );
            }
            // Validar que tenga acceso
            validarAccesoAPaciente(pacienteIdParam);
            return pacienteIdParam;
        } else {
            throw new AccessDeniedException("Rol no autorizado");
        }
    }
}
