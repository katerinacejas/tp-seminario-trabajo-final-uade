package com.cuido.cuido.service;

import com.cuido.cuido.dto.response.CuidadorResponseDTO;
import com.cuido.cuido.dto.response.InvitacionPendienteDTO;
import com.cuido.cuido.dto.response.PacienteResponseDTO;
import com.cuido.cuido.model.CuidadorPaciente;
import com.cuido.cuido.model.CuidadorPaciente.EstadoRelacion;
import com.cuido.cuido.model.Paciente;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.CuidadorPacienteRepository;
import com.cuido.cuido.repository.PacienteRepository;
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
    private final PacienteRepository pacienteRepository;
    private final EmailService emailService;

    @Autowired
    public CuidadorPacienteService(
            CuidadorPacienteRepository cuidadorPacienteRepository,
            UsuarioRepository usuarioRepository,
            PacienteRepository pacienteRepository,
            EmailService emailService
    ) {
        this.cuidadorPacienteRepository = cuidadorPacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
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

    public void rechazarInvitacion(Long relacionId) {
        CuidadorPaciente relacion = cuidadorPacienteRepository.findById(relacionId)
                .orElseThrow(() -> new RuntimeException("Invitación no encontrada"));

        relacion.setEstado(EstadoRelacion.RECHAZADO);
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
                //.findByPacienteIdAndEstado(pacienteId, EstadoRelacion.ACEPTADO);
				.findByPacienteId(pacienteId);
				
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

    public List<InvitacionPendienteDTO> getInvitacionesPendientes(Long cuidadorId) {
        List<CuidadorPaciente> invitaciones = cuidadorPacienteRepository
                .findByCuidadorIdAndEstado(cuidadorId, EstadoRelacion.PENDIENTE);

        return invitaciones.stream()
                .map(this::mapToInvitacionDTO)
                .toList();
    }

    private InvitacionPendienteDTO mapToInvitacionDTO(CuidadorPaciente relacion) {
        Usuario paciente = relacion.getPaciente();
        InvitacionPendienteDTO dto = new InvitacionPendienteDTO();
        dto.setId(relacion.getId());
        dto.setPacienteId(paciente.getId());
        dto.setNombreCompletoPaciente(paciente.getNombreCompleto());
        dto.setEmailPaciente(paciente.getEmail());
        dto.setFechaInvitacion(relacion.getFechaInvitacion());
        return dto;
    }

    public List<PacienteResponseDTO> getPacientesVinculados(Long cuidadorId) {
        List<CuidadorPaciente> relaciones = cuidadorPacienteRepository
                .findByCuidadorIdAndEstado(cuidadorId, EstadoRelacion.ACEPTADO);

        return relaciones.stream()
                .map(relacion -> {
                    Usuario usuarioPaciente = relacion.getPaciente();
                    Paciente paciente = pacienteRepository.findByUsuarioId(usuarioPaciente.getId())
                            .orElse(null);

                    PacienteResponseDTO dto = new PacienteResponseDTO();
                    dto.setId(paciente != null ? paciente.getId() : null);
                    dto.setUsuarioId(usuarioPaciente.getId());
                    dto.setNombreCompleto(usuarioPaciente.getNombreCompleto());
                    dto.setEmail(usuarioPaciente.getEmail());
					dto.setEstadoRelacion(relacion.getEstado().name());

                    if (paciente != null) {
                        dto.setTipoSanguineo(paciente.getTipoSanguineo());
                        dto.setPeso(paciente.getPeso());
                        dto.setAltura(paciente.getAltura());
                        dto.setAlergias(paciente.getAlergias());
                        dto.setCondicionesMedicas(paciente.getCondicionesMedicas());
                        dto.setNotasImportantes(paciente.getNotasImportantes());
                        dto.setObraSocial(paciente.getObraSocial());
                        dto.setNumeroAfiliado(paciente.getNumeroAfiliado());
                    }

                    return dto;
                })
                .toList();
    }
}
