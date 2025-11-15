package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.ActualizarEstadoRecordatorioRequestDTO;
import com.cuido.cuido.dto.request.CitaMedicaRequestDTO;
import com.cuido.cuido.dto.request.MedicamentoRequestDTO;
import com.cuido.cuido.dto.response.CitaMedicaResponseDTO;
import com.cuido.cuido.dto.response.MedicamentoResponseDTO;
import com.cuido.cuido.dto.response.RecordatorioResponseDTO;
import com.cuido.cuido.service.CitaMedicaService;
import com.cuido.cuido.service.MedicamentoService;
import com.cuido.cuido.service.RecordatorioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/recordatorios")
@RequiredArgsConstructor
public class RecordatorioController {

    private final RecordatorioService recordatorioService;
    private final MedicamentoService medicamentoService;
    private final CitaMedicaService citaMedicaService;

    // ==================== RECORDATORIOS (Vista unificada) ====================

    /**
     * GET /api/recordatorios/paciente/{pacienteId}
     * Obtiene todos los recordatorios de un paciente
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<RecordatorioResponseDTO>> obtenerRecordatoriosPorPaciente(
        @PathVariable Long pacienteId
    ) {
        List<RecordatorioResponseDTO> recordatorios = recordatorioService.obtenerRecordatoriosPorPaciente(pacienteId);
        return ResponseEntity.ok(recordatorios);
    }

    /**
     * GET /api/recordatorios/paciente/{pacienteId}/dia?fecha=2025-11-10
     * Obtiene los recordatorios de un día específico
     */
    @GetMapping("/paciente/{pacienteId}/dia")
    public ResponseEntity<List<RecordatorioResponseDTO>> obtenerRecordatoriosDelDia(
        @PathVariable Long pacienteId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        List<RecordatorioResponseDTO> recordatorios = recordatorioService.obtenerRecordatoriosDelDia(pacienteId, fecha);
        return ResponseEntity.ok(recordatorios);
    }

    /**
     * GET /api/recordatorios/paciente/{pacienteId}/rango?inicio=...&fin=...
     * Obtiene los recordatorios de un rango de fechas
     */
    @GetMapping("/paciente/{pacienteId}/rango")
    public ResponseEntity<List<RecordatorioResponseDTO>> obtenerRecordatoriosPorRango(
        @PathVariable Long pacienteId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        List<RecordatorioResponseDTO> recordatorios = recordatorioService.obtenerRecordatoriosPorRango(pacienteId, inicio, fin);
        return ResponseEntity.ok(recordatorios);
    }

    /**
     * GET /api/recordatorios/paciente/{pacienteId}/pendientes
     * Obtiene solo los recordatorios pendientes
     */
    @GetMapping("/paciente/{pacienteId}/pendientes")
    public ResponseEntity<List<RecordatorioResponseDTO>> obtenerRecordatoriosPendientes(
        @PathVariable Long pacienteId
    ) {
        List<RecordatorioResponseDTO> recordatorios = recordatorioService.obtenerRecordatoriosPendientes(pacienteId);
        return ResponseEntity.ok(recordatorios);
    }

    /**
     * PATCH /api/recordatorios/{id}/estado
     * Actualiza el estado de un recordatorio
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<RecordatorioResponseDTO> actualizarEstadoRecordatorio(
        @PathVariable Long id,
        @Valid @RequestBody ActualizarEstadoRecordatorioRequestDTO request
    ) {
        RecordatorioResponseDTO recordatorio = recordatorioService.actualizarEstadoRecordatorio(id, request.getEstado());
        return ResponseEntity.ok(recordatorio);
    }

    /**
     * PATCH /api/recordatorios/{id}/ciclar-estado
     * Cambia el estado del recordatorio de forma cíclica (PENDIENTE -> COMPLETADO -> CANCELADO -> PENDIENTE)
     */
    @PatchMapping("/{id}/ciclar-estado")
    public ResponseEntity<RecordatorioResponseDTO> ciclarEstadoRecordatorio(@PathVariable Long id) {
        RecordatorioResponseDTO recordatorio = recordatorioService.ciclarEstadoRecordatorio(id);
        return ResponseEntity.ok(recordatorio);
    }

    /**
     * DELETE /api/recordatorios/{id}
     * Elimina un recordatorio individual (instancia)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRecordatorioInstancia(@PathVariable Long id) {
        recordatorioService.eliminarRecordatorioInstancia(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== MEDICAMENTOS ====================

    /**
     * POST /api/recordatorios/medicamentos
     * Crea un nuevo medicamento (y genera sus recordatorios automáticamente)
     */
    @PostMapping("/medicamentos")
    public ResponseEntity<MedicamentoResponseDTO> crearMedicamento(
        @Valid @RequestBody MedicamentoRequestDTO request,
        Authentication authentication
    ) {
        Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);
        MedicamentoResponseDTO medicamento = medicamentoService.crearMedicamento(request, cuidadorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(medicamento);
    }

    /**
     * GET /api/recordatorios/medicamentos/paciente/{pacienteId}
     * Obtiene todos los medicamentos de un paciente
     */
    @GetMapping("/medicamentos/paciente/{pacienteId}")
    public ResponseEntity<List<MedicamentoResponseDTO>> obtenerMedicamentosPorPaciente(
        @PathVariable Long pacienteId,
        @RequestParam(required = false) Boolean soloActivos
    ) {
        List<MedicamentoResponseDTO> medicamentos = medicamentoService.obtenerMedicamentosPorPaciente(pacienteId, soloActivos);
        return ResponseEntity.ok(medicamentos);
    }

    /**
     * GET /api/recordatorios/medicamentos/{id}
     * Obtiene un medicamento por ID
     */
    @GetMapping("/medicamentos/{id}")
    public ResponseEntity<MedicamentoResponseDTO> obtenerMedicamentoPorId(@PathVariable Long id) {
        MedicamentoResponseDTO medicamento = medicamentoService.obtenerMedicamentoPorId(id);
        return ResponseEntity.ok(medicamento);
    }

    /**
     * PATCH /api/recordatorios/medicamentos/{id}/desactivar
     * Desactiva un medicamento (no elimina sus recordatorios pasados)
     */
    @PatchMapping("/medicamentos/{id}/desactivar")
    public ResponseEntity<MedicamentoResponseDTO> desactivarMedicamento(@PathVariable Long id) {
        MedicamentoResponseDTO medicamento = medicamentoService.desactivarMedicamento(id);
        return ResponseEntity.ok(medicamento);
    }

    /**
     * DELETE /api/recordatorios/medicamentos/{id}
     * Elimina un medicamento y todos sus recordatorios asociados
     */
    @DeleteMapping("/medicamentos/{id}")
    public ResponseEntity<Void> eliminarMedicamento(@PathVariable Long id) {
        medicamentoService.eliminarMedicamento(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== CITAS MÉDICAS ====================

    /**
     * POST /api/recordatorios/citas
     * Crea una nueva cita médica (y genera su recordatorio automáticamente)
     */
    @PostMapping("/citas")
    public ResponseEntity<CitaMedicaResponseDTO> crearCitaMedica(
        @Valid @RequestBody CitaMedicaRequestDTO request,
        Authentication authentication
    ) {
        Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);
        CitaMedicaResponseDTO cita = citaMedicaService.crearCitaMedica(request, cuidadorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(cita);
    }

    /**
     * GET /api/recordatorios/citas/paciente/{pacienteId}
     * Obtiene todas las citas médicas de un paciente
     */
    @GetMapping("/citas/paciente/{pacienteId}")
    public ResponseEntity<List<CitaMedicaResponseDTO>> obtenerCitasPorPaciente(@PathVariable Long pacienteId) {
        List<CitaMedicaResponseDTO> citas = citaMedicaService.obtenerCitasPorPaciente(pacienteId);
        return ResponseEntity.ok(citas);
    }

    /**
     * GET /api/recordatorios/citas/{id}
     * Obtiene una cita médica por ID
     */
    @GetMapping("/citas/{id}")
    public ResponseEntity<CitaMedicaResponseDTO> obtenerCitaPorId(@PathVariable Long id) {
        CitaMedicaResponseDTO cita = citaMedicaService.obtenerCitaPorId(id);
        return ResponseEntity.ok(cita);
    }

    /**
     * DELETE /api/recordatorios/citas/{id}
     * Elimina una cita médica y su recordatorio asociado
     */
    @DeleteMapping("/citas/{id}")
    public ResponseEntity<Void> eliminarCita(@PathVariable Long id) {
        citaMedicaService.eliminarCita(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== HELPER ====================

    private Long obtenerUsuarioIdDeAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.cuido.cuido.model.Usuario) {
            com.cuido.cuido.model.Usuario usuario = (com.cuido.cuido.model.Usuario) authentication.getPrincipal();
            return usuario.getId();
        }
        throw new RuntimeException("No se pudo obtener el usuario autenticado");
    }
}
