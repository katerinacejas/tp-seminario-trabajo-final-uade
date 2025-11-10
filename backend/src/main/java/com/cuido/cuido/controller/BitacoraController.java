package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.BitacoraRequestDTO;
import com.cuido.cuido.dto.response.BitacoraResponseDTO;
import com.cuido.cuido.service.BitacoraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bitacoras")
@RequiredArgsConstructor
public class BitacoraController {

    private final BitacoraService bitacoraService;

    /**
     * POST /api/bitacoras
     * Crear una nueva bitácora
     */
    @PostMapping
    public ResponseEntity<BitacoraResponseDTO> crearBitacora(
        @Valid @RequestBody BitacoraRequestDTO request,
        Authentication authentication
    ) {
        Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);
        BitacoraResponseDTO bitacora = bitacoraService.crearBitacora(request, cuidadorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(bitacora);
    }

    /**
     * GET /api/bitacoras/paciente/{pacienteId}
     * Obtener todas las bitácoras de un paciente
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<BitacoraResponseDTO>> obtenerBitacorasPorPaciente(
        @PathVariable Long pacienteId
    ) {
        List<BitacoraResponseDTO> bitacoras = bitacoraService.obtenerBitacorasPorPaciente(pacienteId);
        return ResponseEntity.ok(bitacoras);
    }

    /**
     * GET /api/bitacoras/paciente/{pacienteId}/rango?inicio=...&fin=...
     * Obtener bitácoras de un paciente en un rango de fechas
     */
    @GetMapping("/paciente/{pacienteId}/rango")
    public ResponseEntity<List<BitacoraResponseDTO>> obtenerBitacorasPorPacienteYRango(
        @PathVariable Long pacienteId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    ) {
        List<BitacoraResponseDTO> bitacoras = bitacoraService.obtenerBitacorasPorPacienteYRango(pacienteId, inicio, fin);
        return ResponseEntity.ok(bitacoras);
    }

    /**
     * GET /api/bitacoras/mis-bitacoras
     * Obtener todas las bitácoras creadas por el cuidador autenticado
     */
    @GetMapping("/mis-bitacoras")
    public ResponseEntity<List<BitacoraResponseDTO>> obtenerMisBitacoras(
        Authentication authentication
    ) {
        Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);
        List<BitacoraResponseDTO> bitacoras = bitacoraService.obtenerBitacorasPorCuidador(cuidadorId);
        return ResponseEntity.ok(bitacoras);
    }

    /**
     * GET /api/bitacoras/{id}
     * Obtener una bitácora por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<BitacoraResponseDTO> obtenerBitacoraPorId(@PathVariable Long id) {
        BitacoraResponseDTO bitacora = bitacoraService.obtenerBitacoraPorId(id);
        return ResponseEntity.ok(bitacora);
    }

    /**
     * PUT /api/bitacoras/{id}
     * Actualizar una bitácora existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<BitacoraResponseDTO> actualizarBitacora(
        @PathVariable Long id,
        @Valid @RequestBody BitacoraRequestDTO request,
        Authentication authentication
    ) {
        Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);
        BitacoraResponseDTO bitacora = bitacoraService.actualizarBitacora(id, request, cuidadorId);
        return ResponseEntity.ok(bitacora);
    }

    /**
     * DELETE /api/bitacoras/{id}
     * Eliminar una bitácora
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBitacora(@PathVariable Long id) {
        bitacoraService.eliminarBitacora(id);
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
