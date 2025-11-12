package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.TareaRequestDTO;
import com.cuido.cuido.dto.response.TareaResponseDTO;
import com.cuido.cuido.model.Tarea;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.TareaRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaService {

    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Crear nueva tarea
     */
    @Transactional
    public TareaResponseDTO crearTarea(TareaRequestDTO dto, Long cuidadorId) {
        Usuario paciente = usuarioRepository.findById(dto.getPacienteId())
            .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        Usuario cuidador = usuarioRepository.findById(cuidadorId)
            .orElseThrow(() -> new RuntimeException("Cuidador no encontrado"));

        // Obtener el siguiente orden manual (al final de la lista)
        Integer maxOrden = tareaRepository.findMaxOrdenManualByPacienteId(dto.getPacienteId());

        Tarea tarea = new Tarea();
        tarea.setPaciente(paciente);
        tarea.setCuidador(cuidador);
        tarea.setTitulo(dto.getTitulo());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setFechaVencimiento(dto.getFechaVencimiento());
        tarea.setPrioridad(dto.getPrioridad() != null ? dto.getPrioridad() : Tarea.Prioridad.MEDIA);
        tarea.setCompletada(dto.getCompletada() != null ? dto.getCompletada() : false);
        tarea.setOrdenManual(maxOrden + 1);

        tarea = tareaRepository.save(tarea);
        return convertirADTO(tarea);
    }

    /**
     * Obtener todas las tareas de un paciente
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> getTareasByPaciente(Long pacienteId) {
        List<Tarea> tareas = tareaRepository.findByPacienteIdOrderByOrdenManualAsc(pacienteId);
        return tareas.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener tareas filtradas por estado (completadas/pendientes)
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> getTareasByPacienteYEstado(Long pacienteId, Boolean completada) {
        List<Tarea> tareas = tareaRepository.findByPacienteIdAndCompletadaOrderByOrdenManualAsc(pacienteId, completada);
        return tareas.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener tareas en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> getTareasByPacienteYRangoFechas(
        Long pacienteId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    ) {
        List<Tarea> tareas = tareaRepository.findByPacienteIdAndFechaVencimientoBetween(
            pacienteId, fechaInicio, fechaFin
        );
        return tareas.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener una tarea por ID
     */
    @Transactional(readOnly = true)
    public TareaResponseDTO getTareaById(Long tareaId) {
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        return convertirADTO(tarea);
    }

    /**
     * Actualizar tarea
     */
    @Transactional
    public TareaResponseDTO actualizarTarea(Long tareaId, TareaRequestDTO dto) {
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tarea.setTitulo(dto.getTitulo());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setFechaVencimiento(dto.getFechaVencimiento());

        if (dto.getPrioridad() != null) {
            tarea.setPrioridad(dto.getPrioridad());
        }

        if (dto.getCompletada() != null) {
            tarea.setCompletada(dto.getCompletada());
        }

        tarea = tareaRepository.save(tarea);
        return convertirADTO(tarea);
    }

    /**
     * Toggle completada
     */
    @Transactional
    public TareaResponseDTO toggleCompletada(Long tareaId) {
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tarea.setCompletada(!tarea.getCompletada());

        tarea = tareaRepository.save(tarea);
        return convertirADTO(tarea);
    }

    /**
     * Mover tarea arriba (disminuir orden manual)
     */
    @Transactional
    public void moverTareaArriba(Long tareaId) {
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        List<Tarea> todasLasTareas = tareaRepository.findByPacienteIdOrderByOrdenManualAsc(
            tarea.getPaciente().getId()
        );

        int indiceActual = -1;
        for (int i = 0; i < todasLasTareas.size(); i++) {
            if (todasLasTareas.get(i).getId().equals(tareaId)) {
                indiceActual = i;
                break;
            }
        }

        // Si no es la primera, intercambiar con la anterior
        if (indiceActual > 0) {
            Tarea tareaAnterior = todasLasTareas.get(indiceActual - 1);
            Integer ordenTemp = tarea.getOrdenManual();
            tarea.setOrdenManual(tareaAnterior.getOrdenManual());
            tareaAnterior.setOrdenManual(ordenTemp);

            tareaRepository.save(tarea);
            tareaRepository.save(tareaAnterior);
        }
    }

    /**
     * Mover tarea abajo (aumentar orden manual)
     */
    @Transactional
    public void moverTareaAbajo(Long tareaId) {
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        List<Tarea> todasLasTareas = tareaRepository.findByPacienteIdOrderByOrdenManualAsc(
            tarea.getPaciente().getId()
        );

        int indiceActual = -1;
        for (int i = 0; i < todasLasTareas.size(); i++) {
            if (todasLasTareas.get(i).getId().equals(tareaId)) {
                indiceActual = i;
                break;
            }
        }

        // Si no es la última, intercambiar con la siguiente
        if (indiceActual < todasLasTareas.size() - 1 && indiceActual >= 0) {
            Tarea tareaSiguiente = todasLasTareas.get(indiceActual + 1);
            Integer ordenTemp = tarea.getOrdenManual();
            tarea.setOrdenManual(tareaSiguiente.getOrdenManual());
            tareaSiguiente.setOrdenManual(ordenTemp);

            tareaRepository.save(tarea);
            tareaRepository.save(tareaSiguiente);
        }
    }

    /**
     * Eliminar tarea
     */
    @Transactional
    public void eliminarTarea(Long tareaId) {
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tareaRepository.delete(tarea);

        // Reordenar las tareas restantes
        List<Tarea> tareasRestantes = tareaRepository.findByPacienteIdOrderByOrdenManualAsc(
            tarea.getPaciente().getId()
        );

        for (int i = 0; i < tareasRestantes.size(); i++) {
            tareasRestantes.get(i).setOrdenManual(i + 1);
        }

        tareaRepository.saveAll(tareasRestantes);
    }

    /**
     * Convertir entidad a DTO
     */
    private TareaResponseDTO convertirADTO(Tarea tarea) {
        boolean vencida = false;
        if (tarea.getFechaVencimiento() != null && !tarea.getCompletada()) {
            vencida = tarea.getFechaVencimiento().isBefore(LocalDateTime.now());
        }

        return TareaResponseDTO.builder()
            .id(tarea.getId())
            .pacienteId(tarea.getPaciente().getId())
            .pacienteNombre(tarea.getPaciente().getNombreCompleto())
            .cuidadorId(tarea.getCuidador().getId())
            .cuidadorNombre(tarea.getCuidador().getNombreCompleto())
            .titulo(tarea.getTitulo())
            .descripcion(tarea.getDescripcion())
            .fechaVencimiento(tarea.getFechaVencimiento())
            .prioridad(tarea.getPrioridad())
            .completada(tarea.getCompletada())
            .fechaCompletada(tarea.getFechaCompletada())
            .ordenManual(tarea.getOrdenManual())
            .createdAt(tarea.getCreatedAt())
            .updatedAt(tarea.getUpdatedAt())
            .vencida(vencida)
            .build();
    }
}
