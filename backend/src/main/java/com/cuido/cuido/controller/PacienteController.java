package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.ActualizarPerfilPacienteRequest;
import com.cuido.cuido.dto.response.PacienteResponseDTO;
import com.cuido.cuido.service.PacienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    /**
     * Obtener todos los pacientes (solo admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PacienteResponseDTO> getTodosLosPacientes() {
        return pacienteService.getTodosLosPacientes();
    }

    /**
     * Obtener paciente por ID (cuidadores y pacientes)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUIDADOR', 'PACIENTE', 'ADMIN')")
    public ResponseEntity<PacienteResponseDTO> getPacientePorId(@PathVariable Long id) {
        return pacienteService.getPacientePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtener paciente por usuario ID (útil para obtener info del paciente desde el usuario)
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('CUIDADOR', 'PACIENTE', 'ADMIN')")
    public ResponseEntity<PacienteResponseDTO> getPacientePorUsuarioId(@PathVariable Long usuarioId) {
        return pacienteService.getPacientePorUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Actualizar perfil del paciente
     */
    @PutMapping("/perfil/{usuarioId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<PacienteResponseDTO> actualizarPerfil(
            @PathVariable Long usuarioId,
            @Valid @RequestBody ActualizarPerfilPacienteRequest request
    ) {
        try {
            PacienteResponseDTO paciente = pacienteService.actualizarPerfil(usuarioId, request);
            return ResponseEntity.ok(paciente);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
