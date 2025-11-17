package com.cuido.cuido.service;

import com.cuido.cuido.dto.response.RecordatorioResponseDTO;
import com.cuido.cuido.exception.BadRequestException;
import com.cuido.cuido.exception.ResourceNotFoundException;
import com.cuido.cuido.model.CitaMedica;
import com.cuido.cuido.model.Medicamento;
import com.cuido.cuido.model.RecordatorioInstancia;
import com.cuido.cuido.repository.CitaMedicaRepository;
import com.cuido.cuido.repository.MedicamentoRepository;
import com.cuido.cuido.repository.RecordatorioInstanciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordatorioService {

    private final RecordatorioInstanciaRepository recordatorioInstanciaRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final CitaMedicaRepository citaMedicaRepository;
    private final AuthorizationService authorizationService;

    /**
     * Obtiene todos los recordatorios de un paciente
     */
    public List<RecordatorioResponseDTO> obtenerRecordatoriosPorPaciente(Long pacienteId) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(pacienteId);

        List<RecordatorioInstancia> recordatorios = recordatorioInstanciaRepository
            .findByPacienteIdOrderByFechaHoraAsc(pacienteId);

        return recordatorios.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene los recordatorios de un paciente para un día específico
     */
    public List<RecordatorioResponseDTO> obtenerRecordatoriosDelDia(Long pacienteId, LocalDate fecha) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(pacienteId);

        LocalDateTime inicioDelDia = fecha.atStartOfDay();
        LocalDateTime finDelDia = fecha.atTime(LocalTime.MAX);

        List<RecordatorioInstancia> recordatorios = recordatorioInstanciaRepository
            .findRecordatoriosDelDia(pacienteId, inicioDelDia, finDelDia);

        return recordatorios.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene los recordatorios de un rango de fechas
     */
    public List<RecordatorioResponseDTO> obtenerRecordatoriosPorRango(
        Long pacienteId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    ) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(pacienteId);

        List<RecordatorioInstancia> recordatorios = recordatorioInstanciaRepository
            .findByPacienteIdAndFechaHoraBetweenOrderByFechaHoraAsc(pacienteId, fechaInicio, fechaFin);

        return recordatorios.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene los recordatorios pendientes de un paciente
     */
    public List<RecordatorioResponseDTO> obtenerRecordatoriosPendientes(Long pacienteId) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(pacienteId);

        List<RecordatorioInstancia> recordatorios = recordatorioInstanciaRepository
            .findByPacienteIdAndEstadoOrderByFechaHoraAsc(
                pacienteId,
                RecordatorioInstancia.EstadoRecordatorio.PENDIENTE
            );

        return recordatorios.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Actualiza el estado de un recordatorio (ciclo: PENDIENTE -> COMPLETADO -> CANCELADO -> PENDIENTE)
     */
    @Transactional
    public RecordatorioResponseDTO actualizarEstadoRecordatorio(Long recordatorioId, String nuevoEstado) {
        RecordatorioInstancia recordatorio = recordatorioInstanciaRepository.findById(recordatorioId)
            .orElseThrow(() -> new ResourceNotFoundException("Recordatorio no encontrado"));

        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(recordatorio.getPaciente().getId());

        try {
            RecordatorioInstancia.EstadoRecordatorio estado =
                RecordatorioInstancia.EstadoRecordatorio.valueOf(nuevoEstado.toUpperCase());
            recordatorio.setEstado(estado);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Estado inválido: " + nuevoEstado);
        }

        RecordatorioInstancia recordatorioActualizado = recordatorioInstanciaRepository.save(recordatorio);
        return mapToResponseDTO(recordatorioActualizado);
    }

    /**
     * Cambia el estado del recordatorio de forma cíclica
     */
    @Transactional
    public RecordatorioResponseDTO ciclarEstadoRecordatorio(Long recordatorioId) {
        RecordatorioInstancia recordatorio = recordatorioInstanciaRepository.findById(recordatorioId)
            .orElseThrow(() -> new ResourceNotFoundException("Recordatorio no encontrado"));

        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(recordatorio.getPaciente().getId());

        // Ciclo: PENDIENTE -> COMPLETADO -> CANCELADO -> PENDIENTE
        RecordatorioInstancia.EstadoRecordatorio estadoActual = recordatorio.getEstado();
        RecordatorioInstancia.EstadoRecordatorio nuevoEstado;

        switch (estadoActual) {
            case PENDIENTE:
                nuevoEstado = RecordatorioInstancia.EstadoRecordatorio.COMPLETADO;
                break;
            case COMPLETADO:
                nuevoEstado = RecordatorioInstancia.EstadoRecordatorio.CANCELADO;
                break;
            case CANCELADO:
                nuevoEstado = RecordatorioInstancia.EstadoRecordatorio.PENDIENTE;
                break;
            default:
                nuevoEstado = RecordatorioInstancia.EstadoRecordatorio.PENDIENTE;
        }

        recordatorio.setEstado(nuevoEstado);
        RecordatorioInstancia recordatorioActualizado = recordatorioInstanciaRepository.save(recordatorio);

        return mapToResponseDTO(recordatorioActualizado);
    }

    /**
     * Elimina un recordatorio individual (instancia)
     */
    @Transactional
    public void eliminarRecordatorioInstancia(Long recordatorioId) {
        RecordatorioInstancia recordatorio = recordatorioInstanciaRepository.findById(recordatorioId)
            .orElseThrow(() -> new ResourceNotFoundException("Recordatorio no encontrado"));

        // VALIDAR ACCESO: Solo cuidadores autorizados pueden eliminar recordatorios
        authorizationService.validarAccesoAPaciente(recordatorio.getPaciente().getId());

        recordatorioInstanciaRepository.delete(recordatorio);
    }

    /**
     * Mapea una instancia de recordatorio a DTO con información enriquecida
     */
    private RecordatorioResponseDTO mapToResponseDTO(RecordatorioInstancia recordatorio) {
        RecordatorioResponseDTO.RecordatorioResponseDTOBuilder builder = RecordatorioResponseDTO.builder()
            .id(recordatorio.getId())
            .tipo(recordatorio.getTipo().name())
            .referenciaId(recordatorio.getReferenciaId())
            .pacienteId(recordatorio.getPaciente().getId())
            .pacienteNombre(recordatorio.getPaciente().getNombreCompleto())
            .fechaHora(recordatorio.getFechaHora())
            .estado(recordatorio.getEstado().name())
            .descripcion(recordatorio.getDescripcion())
            .observaciones(recordatorio.getObservaciones());

        // Enriquecer con información específica según el tipo
        if (recordatorio.getTipo() == RecordatorioInstancia.TipoRecordatorio.MEDICAMENTO) {
            medicamentoRepository.findById(recordatorio.getReferenciaId()).ifPresent(medicamento -> {
                builder.nombreMedicamento(medicamento.getNombre());
                builder.dosis(medicamento.getDosis());
            });
        } else if (recordatorio.getTipo() == RecordatorioInstancia.TipoRecordatorio.CITA_MEDICA) {
            citaMedicaRepository.findById(recordatorio.getReferenciaId()).ifPresent(cita -> {
                builder.ubicacion(cita.getUbicacion());
                builder.nombreDoctor(cita.getNombreDoctor());
                builder.especialidad(cita.getEspecialidad());
                builder.motivo(cita.getMotivo());
            });
        }

        return builder.build();
    }
}
