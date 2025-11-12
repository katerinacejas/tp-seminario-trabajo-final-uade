package com.cuido.cuido.service;

import com.cuido.cuido.dto.response.PacienteResponseDTO;
import com.cuido.cuido.model.Paciente;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.PacienteRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    @Autowired
    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
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

    private PacienteResponseDTO mapToResponseDTO(Paciente paciente) {
        PacienteResponseDTO dto = new PacienteResponseDTO();
        dto.setId(paciente.getId());
        dto.setUsuarioId(paciente.getUsuario().getId());
        dto.setNombreCompleto(paciente.getUsuario().getNombreCompleto());

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
        dto.setObservaciones(paciente.getObservaciones());
        dto.setObraSocial(paciente.getObraSocial());
        dto.setNumeroAfiliado(paciente.getNumeroAfiliado());

        return dto;
    }
}
