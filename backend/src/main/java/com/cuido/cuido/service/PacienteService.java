package com.cuido.cuido.service;

import com.cuido.cuido.dto.response.UsuarioResponseDTO;
import com.cuido.cuido.model.Rol;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para operaciones relacionadas con pacientes.
 */
@Service
public class PacienteService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Busca pacientes por nombre (parcial o completo).
     *
     * @param nombre Nombre a buscar
     * @return Lista de pacientes que coinciden
     */
    public List<UsuarioResponseDTO> buscarPacientesPorNombre(String nombre) {
        List<Usuario> pacientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == Rol.PACIENTE)
                .filter(u -> u.getNombreCompleto().toLowerCase().contains(nombre.toLowerCase()))
                .collect(Collectors.toList());

        return pacientes.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un paciente por su ID.
     *
     * @param id ID del paciente
     * @return Optional con el paciente si existe
     */
    public Optional<UsuarioResponseDTO> obtenerPacientePorId(Long id) {
        return usuarioRepository.findById(id)
                .filter(u -> u.getRol() == Rol.PACIENTE)
                .map(this::convertirADTO);
    }

    /**
     * Verifica si un cuidador tiene acceso a un paciente.
     * Por ahora, asumimos que todos los cuidadores tienen acceso a todos los pacientes.
     * En el futuro, esto debe verificar la tabla cuidador_paciente.
     *
     * @param emailCuidador Email del cuidador
     * @param pacienteId ID del paciente
     * @return true si tiene acceso, false en caso contrario
     */
    public boolean verificarAccesoCuidador(String emailCuidador, Long pacienteId) {
        // Verificar que el cuidador exista
        Optional<Usuario> cuidador = usuarioRepository.findByEmail(emailCuidador);
        if (cuidador.isEmpty() || cuidador.get().getRol() != Rol.CUIDADOR) {
            return false;
        }

        // Verificar que el paciente exista
        Optional<Usuario> paciente = usuarioRepository.findById(pacienteId);
        if (paciente.isEmpty() || paciente.get().getRol() != Rol.PACIENTE) {
            return false;
        }

        // TODO: Verificar en la tabla cuidador_paciente cuando esté implementada
        // Por ahora, retornamos true (todos los cuidadores tienen acceso a todos los pacientes)
        return true;
    }

    /**
     * Obtiene todos los pacientes vinculados a un cuidador.
     *
     * @param emailCuidador Email del cuidador
     * @return Lista de pacientes
     */
    public List<UsuarioResponseDTO> obtenerPacientesDelCuidador(String emailCuidador) {
        // TODO: Implementar cuando exista la tabla cuidador_paciente
        // Por ahora, retornamos todos los pacientes
        List<Usuario> pacientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == Rol.PACIENTE)
                .collect(Collectors.toList());

        return pacientes.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte un Usuario a UsuarioResponseDTO.
     *
     * @param usuario Usuario a convertir
     * @return DTO con los datos del usuario
     */
    private UsuarioResponseDTO convertirADTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        dto.setEmail(usuario.getEmail());
        dto.setDireccion(usuario.getDireccion());
        dto.setTelefono(usuario.getTelefono());
        dto.setFechaNacimiento(usuario.getFechaNacimiento());
        dto.setAvatar(usuario.getAvatar());
        dto.setRol(usuario.getRol());
        return dto;
    }
}
