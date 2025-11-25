package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.CitaMedicaRequestDTO;
import com.cuido.cuido.dto.response.CitaMedicaResponseDTO;
import com.cuido.cuido.exception.ResourceNotFoundException;
import com.cuido.cuido.model.CitaMedica;
import com.cuido.cuido.model.RecordatorioInstancia;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.CitaMedicaRepository;
import com.cuido.cuido.repository.RecordatorioInstanciaRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaMedicaService {

    private final CitaMedicaRepository citaMedicaRepository;
    private final RecordatorioInstanciaRepository recordatorioInstanciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthorizationService authorizationService;

    @Transactional
    public CitaMedicaResponseDTO crearCitaMedica(CitaMedicaRequestDTO request, Long cuidadorId) {
        // VALIDAR ACCESO: Solo cuidadores autorizados pueden crear citas médicas
        //authorizationService.validarAccesoAPaciente(request.getPacienteId());

        Usuario paciente = usuarioRepository.findById(request.getPacienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        Usuario cuidador = usuarioRepository.findById(cuidadorId)
            .orElseThrow(() -> new ResourceNotFoundException("Cuidador no encontrado"));

        CitaMedica citaMedica = new CitaMedica();
        citaMedica.setPaciente(paciente);
        citaMedica.setCuidador(cuidador);
        citaMedica.setFechaHora(request.getFechaHora());
        citaMedica.setUbicacion(request.getUbicacion());
        citaMedica.setNombreDoctor(request.getNombreDoctor());
        citaMedica.setEspecialidad(request.getEspecialidad());
        citaMedica.setMotivo(request.getMotivo());
        citaMedica.setObservaciones(request.getObservaciones());

        CitaMedica citaGuardada = citaMedicaRepository.save(citaMedica);

        // Crear instancia de recordatorio
        crearRecordatorioDesdeCita(citaGuardada);

        return mapToResponseDTO(citaGuardada);
    }

    @Transactional
    public void crearRecordatorioDesdeCita(CitaMedica cita) {
        RecordatorioInstancia recordatorio = new RecordatorioInstancia();
        recordatorio.setTipo(RecordatorioInstancia.TipoRecordatorio.CITA_MEDICA);
        recordatorio.setReferenciaId(cita.getId());
        recordatorio.setPaciente(cita.getPaciente());
        recordatorio.setFechaHora(cita.getFechaHora());
        recordatorio.setEstado(RecordatorioInstancia.EstadoRecordatorio.PENDIENTE);

        String descripcion = "Cita médica";
        if (cita.getEspecialidad() != null && !cita.getEspecialidad().isEmpty()) {
            descripcion += " - " + cita.getEspecialidad();
        }
        if (cita.getNombreDoctor() != null && !cita.getNombreDoctor().isEmpty()) {
            descripcion += " con " + cita.getNombreDoctor();
        }

        recordatorio.setDescripcion(descripcion);
        recordatorio.setObservaciones(cita.getMotivo());

        recordatorioInstanciaRepository.save(recordatorio);
    }

    public List<CitaMedicaResponseDTO> obtenerCitasPorPaciente(Long pacienteId) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        ////authorizationService.validarAccesoAPaciente(pacienteId);

        List<CitaMedica> citas = citaMedicaRepository.findByPacienteIdOrderByFechaHoraAsc(pacienteId);
        return citas.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public CitaMedicaResponseDTO obtenerCitaPorId(Long id) {
        CitaMedica cita = citaMedicaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cita médica no encontrada"));

        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        ////authorizationService.validarAccesoAPaciente(cita.getPaciente().getId());

        return mapToResponseDTO(cita);
    }

    @Transactional
    public void eliminarCita(Long id) {
        CitaMedica cita = citaMedicaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cita médica no encontrada"));

        // VALIDAR ACCESO: Solo cuidadores autorizados pueden eliminar citas médicas
        ////authorizationService.validarAccesoAPaciente(cita.getPaciente().getId());

        // Eliminar recordatorios asociados
        recordatorioInstanciaRepository.deleteByTipoAndReferenciaId(
            RecordatorioInstancia.TipoRecordatorio.CITA_MEDICA,
            id
        );

        citaMedicaRepository.delete(cita);
    }

    private CitaMedicaResponseDTO mapToResponseDTO(CitaMedica cita) {
        return CitaMedicaResponseDTO.builder()
            .id(cita.getId())
            .pacienteId(cita.getPaciente().getId())
            .pacienteNombre(cita.getPaciente().getNombreCompleto())
            .cuidadorId(cita.getCuidador().getId())
            .cuidadorNombre(cita.getCuidador().getNombreCompleto())
            .fechaHora(cita.getFechaHora())
            .ubicacion(cita.getUbicacion())
            .nombreDoctor(cita.getNombreDoctor())
            .especialidad(cita.getEspecialidad())
            .motivo(cita.getMotivo())
            .observaciones(cita.getObservaciones())
            .completada(cita.getCompletada())
            .createdAt(cita.getCreatedAt())
            .build();
    }
}
