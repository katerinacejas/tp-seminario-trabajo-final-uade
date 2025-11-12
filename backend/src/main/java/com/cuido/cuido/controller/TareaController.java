package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.TareaRequestDTO;
import com.cuido.cuido.dto.response.TareaResponseDTO;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.service.TareaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService tareaService;

    /**
     * Crear una tarea
     * POST /api/tareas
     */
    @PostMapping
    public ResponseEntity<TareaResponseDTO> crearTarea(
        @Valid @RequestBody TareaRequestDTO dto,
        Authentication authentication
    ) {
        Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);
        TareaResponseDTO tarea = tareaService.crearTarea(dto, cuidadorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(tarea);
    }

    /**
     * Obtener todas las tareas de un paciente
     * GET /api/tareas/paciente/{pacienteId}
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<TareaResponseDTO>> getTareasByPaciente(
        @PathVariable Long pacienteId
    ) {
        List<TareaResponseDTO> tareas = tareaService.getTareasByPaciente(pacienteId);
        return ResponseEntity.ok(tareas);
    }

    /**
     * Obtener tareas filtradas por estado (completadas/pendientes)
     * GET /api/tareas/paciente/{pacienteId}/estado?completada=true
     */
    @GetMapping("/paciente/{pacienteId}/estado")
    public ResponseEntity<List<TareaResponseDTO>> getTareasByPacienteYEstado(
        @PathVariable Long pacienteId,
        @RequestParam Boolean completada
    ) {
        List<TareaResponseDTO> tareas = tareaService.getTareasByPacienteYEstado(pacienteId, completada);
        return ResponseEntity.ok(tareas);
    }

    /**
     * Obtener tareas en un rango de fechas
     * GET /api/tareas/paciente/{pacienteId}/rango?inicio=...&fin=...
     */
    @GetMapping("/paciente/{pacienteId}/rango")
    public ResponseEntity<List<TareaResponseDTO>> getTareasByPacienteYRangoFechas(
        @PathVariable Long pacienteId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        List<TareaResponseDTO> tareas = tareaService.getTareasByPacienteYRangoFechas(pacienteId, inicio, fin);
        return ResponseEntity.ok(tareas);
    }

    /**
     * Obtener una tarea por ID
     * GET /api/tareas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TareaResponseDTO> getTareaById(@PathVariable Long id) {
        TareaResponseDTO tarea = tareaService.getTareaById(id);
        return ResponseEntity.ok(tarea);
    }

    /**
     * Actualizar tarea
     * PUT /api/tareas/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TareaResponseDTO> actualizarTarea(
        @PathVariable Long id,
        @Valid @RequestBody TareaRequestDTO dto
    ) {
        TareaResponseDTO tarea = tareaService.actualizarTarea(id, dto);
        return ResponseEntity.ok(tarea);
    }

    /**
     * Toggle estado completada
     * PATCH /api/tareas/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TareaResponseDTO> toggleCompletada(@PathVariable Long id) {
        TareaResponseDTO tarea = tareaService.toggleCompletada(id);
        return ResponseEntity.ok(tarea);
    }

    /**
     * Mover tarea arriba
     * PATCH /api/tareas/{id}/mover-arriba
     */
    @PatchMapping("/{id}/mover-arriba")
    public ResponseEntity<Void> moverTareaArriba(@PathVariable Long id) {
        tareaService.moverTareaArriba(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Mover tarea abajo
     * PATCH /api/tareas/{id}/mover-abajo
     */
    @PatchMapping("/{id}/mover-abajo")
    public ResponseEntity<Void> moverTareaAbajo(@PathVariable Long id) {
        tareaService.moverTareaAbajo(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Eliminar tarea
     * DELETE /api/tareas/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id) {
        tareaService.eliminarTarea(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Helper: Obtener usuario ID de autenticación
     */
    private Long obtenerUsuarioIdDeAuthentication(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return usuario.getId();
    }
}
