package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.MedicamentoRequestDTO;
import com.cuido.cuido.dto.response.MedicamentoResponseDTO;
import com.cuido.cuido.exception.ResourceNotFoundException;
import com.cuido.cuido.model.HorarioMedicamento;
import com.cuido.cuido.model.Medicamento;
import com.cuido.cuido.model.RecordatorioInstancia;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.HorarioMedicamentoRepository;
import com.cuido.cuido.repository.MedicamentoRepository;
import com.cuido.cuido.repository.RecordatorioInstanciaRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicamentoService {

    private final MedicamentoRepository medicamentoRepository;
    private final HorarioMedicamentoRepository horarioMedicamentoRepository;
    private final RecordatorioInstanciaRepository recordatorioInstanciaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MedicamentoResponseDTO crearMedicamento(MedicamentoRequestDTO request, Long cuidadorId) {
        Usuario paciente = usuarioRepository.findById(request.getPacienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        Usuario cuidador = usuarioRepository.findById(cuidadorId)
            .orElseThrow(() -> new ResourceNotFoundException("Cuidador no encontrado"));

        Medicamento medicamento = new Medicamento();
        medicamento.setPaciente(paciente);
        medicamento.setCuidador(cuidador);
        medicamento.setNombre(request.getNombre());
        medicamento.setDosis(request.getDosis());
        medicamento.setFrecuencia(request.getFrecuencia());
        medicamento.setViaAdministracion(request.getViaAdministracion());
        medicamento.setFechaInicio(request.getFechaInicio());
        medicamento.setFechaFin(request.getFechaFin());
        medicamento.setObservaciones(request.getObservaciones());
        medicamento.setActivo(true);

        Medicamento medicamentoGuardado = medicamentoRepository.save(medicamento);

        // Guardar horarios
        List<HorarioMedicamento> horarios = new ArrayList<>();
        for (MedicamentoRequestDTO.HorarioDTO horarioDTO : request.getHorarios()) {
            HorarioMedicamento horario = new HorarioMedicamento();
            horario.setMedicamento(medicamentoGuardado);
            horario.setHora(horarioDTO.getHora());
            horario.setDiasSemana(horarioDTO.getDiasSemana());
            horarios.add(horario);
        }
        horarioMedicamentoRepository.saveAll(horarios);
        medicamentoGuardado.setHorarios(horarios);

        // Generar instancias de recordatorios
        generarRecordatoriosDesdeMedicamento(medicamentoGuardado);

        return mapToResponseDTO(medicamentoGuardado);
    }

    @Transactional
    public void generarRecordatoriosDesdeMedicamento(Medicamento medicamento) {
        List<RecordatorioInstancia> recordatorios = new ArrayList<>();

        LocalDate fechaInicio = medicamento.getFechaInicio();
        LocalDate fechaFin = medicamento.getFechaFin();

        // Generar recordatorios para cada día en el rango
        LocalDate fechaActual = fechaInicio;
        while (!fechaActual.isAfter(fechaFin)) {
            final LocalDate fecha = fechaActual;

            // Para cada horario del medicamento
            for (HorarioMedicamento horario : medicamento.getHorarios()) {
                // Si diasSemana es null, es diario
                boolean aplicaHoy = horario.getDiasSemana() == null ||
                                    diasSemanaIncluye(horario.getDiasSemana(), fecha);

                if (aplicaHoy) {
                    RecordatorioInstancia recordatorio = new RecordatorioInstancia();
                    recordatorio.setTipo(RecordatorioInstancia.TipoRecordatorio.MEDICAMENTO);
                    recordatorio.setReferenciaId(medicamento.getId());
                    recordatorio.setPaciente(medicamento.getPaciente());
                    recordatorio.setFechaHora(LocalDateTime.of(fecha, horario.getHora()));
                    recordatorio.setEstado(RecordatorioInstancia.EstadoRecordatorio.PENDIENTE);

                    String descripcion = medicamento.getNombre();
                    if (medicamento.getDosis() != null && !medicamento.getDosis().isEmpty()) {
                        descripcion += " - " + medicamento.getDosis();
                    }
                    recordatorio.setDescripcion(descripcion);

                    recordatorios.add(recordatorio);
                }
            }

            fechaActual = fechaActual.plusDays(1);
        }

        recordatorioInstanciaRepository.saveAll(recordatorios);
    }

    private boolean diasSemanaIncluye(String diasSemanaJson, LocalDate fecha) {
        if (diasSemanaJson == null || diasSemanaJson.isEmpty()) {
            return true; // Si es null, aplica todos los días
        }

        // Mapeo de día de la semana a letra
        // MONDAY=L, TUESDAY=M, WEDNESDAY=X, THURSDAY=J, FRIDAY=V, SATURDAY=S, SUNDAY=D
        String[] mapeo = {"D", "L", "M", "X", "J", "V", "S"}; // Domingo=0, Lunes=1, etc.
        int diaSemana = fecha.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
        String letraDia = mapeo[diaSemana % 7];

        return diasSemanaJson.contains(letraDia);
    }

    public List<MedicamentoResponseDTO> obtenerMedicamentosPorPaciente(Long pacienteId, Boolean soloActivos) {
        List<Medicamento> medicamentos;
        if (soloActivos != null && soloActivos) {
            medicamentos = medicamentoRepository.findByPacienteIdAndActivoTrueOrderByNombreAsc(pacienteId);
        } else {
            medicamentos = medicamentoRepository.findByPacienteIdOrderByCreatedAtDesc(pacienteId);
        }

        return medicamentos.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public MedicamentoResponseDTO obtenerMedicamentoPorId(Long id) {
        Medicamento medicamento = medicamentoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medicamento no encontrado"));
        return mapToResponseDTO(medicamento);
    }

    @Transactional
    public void eliminarMedicamento(Long id) {
        Medicamento medicamento = medicamentoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medicamento no encontrado"));

        // Eliminar recordatorios asociados
        recordatorioInstanciaRepository.deleteByTipoAndReferenciaId(
            RecordatorioInstancia.TipoRecordatorio.MEDICAMENTO,
            id
        );

        // Eliminar horarios
        horarioMedicamentoRepository.deleteByMedicamentoId(id);

        medicamentoRepository.delete(medicamento);
    }

    @Transactional
    public MedicamentoResponseDTO desactivarMedicamento(Long id) {
        Medicamento medicamento = medicamentoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medicamento no encontrado"));

        medicamento.setActivo(false);
        Medicamento medicamentoActualizado = medicamentoRepository.save(medicamento);

        return mapToResponseDTO(medicamentoActualizado);
    }

    private MedicamentoResponseDTO mapToResponseDTO(Medicamento medicamento) {
        List<MedicamentoResponseDTO.HorarioDTO> horariosDTO = medicamento.getHorarios().stream()
            .map(h -> MedicamentoResponseDTO.HorarioDTO.builder()
                .id(h.getId())
                .hora(h.getHora())
                .diasSemana(h.getDiasSemana())
                .build())
            .collect(Collectors.toList());

        return MedicamentoResponseDTO.builder()
            .id(medicamento.getId())
            .pacienteId(medicamento.getPaciente().getId())
            .pacienteNombre(medicamento.getPaciente().getNombreCompleto())
            .cuidadorId(medicamento.getCuidador().getId())
            .cuidadorNombre(medicamento.getCuidador().getNombreCompleto())
            .nombre(medicamento.getNombre())
            .dosis(medicamento.getDosis())
            .frecuencia(medicamento.getFrecuencia())
            .viaAdministracion(medicamento.getViaAdministracion())
            .fechaInicio(medicamento.getFechaInicio())
            .fechaFin(medicamento.getFechaFin())
            .activo(medicamento.getActivo())
            .observaciones(medicamento.getObservaciones())
            .horarios(horariosDTO)
            .build();
    }
}
