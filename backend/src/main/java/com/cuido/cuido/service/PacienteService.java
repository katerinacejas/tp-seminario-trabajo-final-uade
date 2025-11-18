package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.ActualizarPerfilPacienteRequest;
import com.cuido.cuido.dto.response.PacienteResponseDTO;
import com.cuido.cuido.model.Paciente;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.PacienteRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PacienteService(PacienteRepository pacienteRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<PacienteResponseDTO> getPacientePorId(Long id) {
        return pacienteRepository.findById(id)
                .map(this::mapToResponseDTO);
    }

    public Optional<PacienteResponseDTO> getPacientePorUsuarioId(Long usuarioId) {
        return pacienteRepository.findByUsuarioId(usuarioId)
                .map(this::mapToResponseDTO);
    }

    public List<PacienteResponseDTO> getTodosLosPacientes() {
        return pacienteRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public PacienteResponseDTO actualizarPerfil(Long usuarioId, ActualizarPerfilPacienteRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Paciente paciente = pacienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil de paciente no encontrado"));

        // Actualizar datos del usuario
        if (request.getNombreCompleto() != null) {
            usuario.setNombreCompleto(request.getNombreCompleto());
        }

        // IMPORTANTE: No permitir cambio de email aquí porque invalida el JWT token
        // El email solo puede cambiarse desde un endpoint dedicado que maneje la renovación del token
        if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
            throw new IllegalArgumentException("No se puede cambiar el email desde este endpoint. El email es la identidad del usuario y cambiarla requiere un proceso especial.");
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        usuarioRepository.save(usuario);

        // Actualizar datos del paciente
        if (request.getTipoSanguineo() != null) {
            paciente.setTipoSanguineo(request.getTipoSanguineo());
        }
        if (request.getPeso() != null) {
            paciente.setPeso(request.getPeso());
        }
        if (request.getAltura() != null) {
            paciente.setAltura(request.getAltura());
        }
        if (request.getAlergias() != null) {
            paciente.setAlergias(request.getAlergias());
        }
        if (request.getCondicionesMedicas() != null) {
            paciente.setCondicionesMedicas(request.getCondicionesMedicas());
        }
        if (request.getNotasImportantes() != null) {
            paciente.setNotasImportantes(request.getNotasImportantes());
        }
        if (request.getObraSocial() != null) {
            paciente.setObraSocial(request.getObraSocial());
        }
        if (request.getNumeroAfiliado() != null) {
            paciente.setNumeroAfiliado(request.getNumeroAfiliado());
        }

        pacienteRepository.save(paciente);
        return mapToResponseDTO(paciente);
    }

    private PacienteResponseDTO mapToResponseDTO(Paciente paciente) {
        PacienteResponseDTO dto = new PacienteResponseDTO();
        dto.setId(paciente.getId());
        dto.setUsuarioId(paciente.getUsuario().getId());
        dto.setNombreCompleto(paciente.getUsuario().getNombreCompleto());
        dto.setEmail(paciente.getUsuario().getEmail());

        // Calcular edad desde fechaNacimiento
        Usuario usuario = paciente.getUsuario();
        if (usuario.getFechaNacimiento() != null) {
            LocalDate fechaNac = usuario.getFechaNacimiento().toLocalDate();
            LocalDate ahora = LocalDate.now();
            dto.setEdad(Period.between(fechaNac, ahora).getYears());
        }

        dto.setTipoSanguineo(paciente.getTipoSanguineo());
        dto.setPeso(paciente.getPeso());
        dto.setAltura(paciente.getAltura());
        dto.setAlergias(paciente.getAlergias());
        dto.setCondicionesMedicas(paciente.getCondicionesMedicas());
        dto.setNotasImportantes(paciente.getNotasImportantes());
        dto.setObraSocial(paciente.getObraSocial());
        dto.setNumeroAfiliado(paciente.getNumeroAfiliado());

        return dto;
    }
}
