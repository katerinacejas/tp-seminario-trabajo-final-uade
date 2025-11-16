package com.cuido.cuido.service;

import com.cuido.cuido.dto.response.CuidadorResponseDTO;
import com.cuido.cuido.model.CuidadorPaciente;
import com.cuido.cuido.model.CuidadorPaciente.EstadoRelacion;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.CuidadorPacienteRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CuidadorPacienteService {

    private final CuidadorPacienteRepository cuidadorPacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    @Autowired
    public CuidadorPacienteService(
            CuidadorPacienteRepository cuidadorPacienteRepository,
            UsuarioRepository usuarioRepository,
            EmailService emailService
    ) {
        this.cuidadorPacienteRepository = cuidadorPacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    public void invitarCuidador(Long pacienteId, String emailCuidador) {
        Usuario paciente = usuarioRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        Usuario cuidador = usuarioRepository.findByEmail(emailCuidador)
                .orElseThrow(() -> new RuntimeException("No existe un cuidador con ese email"));

        // Verificar que sea rol CUIDADOR
        if (!"CUIDADOR".equals(cuidador.getRol().name())) {
            throw new RuntimeException("El usuario no es un cuidador");
        }

        // Verificar si ya existe una relación
        Optional<CuidadorPaciente> relacionExistente = cuidadorPacienteRepository
                .findByCuidadorIdAndPacienteId(cuidador.getId(), paciente.getId());

        if (relacionExistente.isPresent()) {
            throw new RuntimeException("Ya existe una invitación o relación con este cuidador");
        }

        // Crear la relación en estado PENDIENTE
        CuidadorPaciente relacion = new CuidadorPaciente();
        relacion.setCuidador(cuidador);
        relacion.setPaciente(paciente);
        relacion.setEstado(EstadoRelacion.PENDIENTE);
        relacion.setEsPrincipal(false);

        cuidadorPacienteRepository.save(relacion);

        // Enviar email de invitación
        emailService.enviarInvitacion(
                emailCuidador,
                paciente.getNombreCompleto(),
                cuidador.getNombreCompleto()
        );
    }

    public void aceptarInvitacion(Long relacionId) {
        CuidadorPaciente relacion = cuidadorPacienteRepository.findById(relacionId)
                .orElseThrow(() -> new RuntimeException("Invitación no encontrada"));

        relacion.setEstado(EstadoRelacion.ACEPTADO);
        cuidadorPacienteRepository.save(relacion);
    }

    public void desvincularCuidador(Long pacienteId, Long cuidadorId) {
        CuidadorPaciente relacion = cuidadorPacienteRepository
                .findByCuidadorIdAndPacienteId(cuidadorId, pacienteId)
                .orElseThrow(() -> new RuntimeException("Relación no encontrada"));

        cuidadorPacienteRepository.delete(relacion);
    }

    public List<CuidadorResponseDTO> getCuidadoresPorPaciente(Long pacienteId) {
        List<CuidadorPaciente> relaciones = cuidadorPacienteRepository
                .findByPacienteIdAndEstado(pacienteId, EstadoRelacion.ACEPTADO);

        return relaciones.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private CuidadorResponseDTO mapToDTO(CuidadorPaciente relacion) {
        Usuario cuidador = relacion.getCuidador();
        CuidadorResponseDTO dto = new CuidadorResponseDTO();
        dto.setId(relacion.getId());
        dto.setUsuarioId(cuidador.getId());
        dto.setNombreCompleto(cuidador.getNombreCompleto());
        dto.setEmail(cuidador.getEmail());
        dto.setTelefono(cuidador.getTelefono());
        dto.setEstado(relacion.getEstado().name());
        dto.setEsPrincipal(relacion.getEsPrincipal());
        dto.setFechaInvitacion(relacion.getFechaInvitacion());
        dto.setFechaAceptacion(relacion.getFechaAceptacion());
        return dto;
    }
}
