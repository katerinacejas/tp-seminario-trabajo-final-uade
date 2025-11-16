package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.InvitarCuidadorRequest;
import com.cuido.cuido.dto.response.CuidadorResponseDTO;
import com.cuido.cuido.service.CuidadorPacienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuidadores-pacientes")
public class CuidadorPacienteController {

    private final CuidadorPacienteService cuidadorPacienteService;

    @Autowired
    public CuidadorPacienteController(CuidadorPacienteService cuidadorPacienteService) {
        this.cuidadorPacienteService = cuidadorPacienteService;
    }

    @PostMapping("/invitar")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<String> invitarCuidador(
            @RequestParam Long pacienteId,
            @Valid @RequestBody InvitarCuidadorRequest request
    ) {
        try {
            cuidadorPacienteService.invitarCuidador(pacienteId, request.getEmailCuidador());
            return ResponseEntity.ok("Invitación enviada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{relacionId}/aceptar")
    @PreAuthorize("hasRole('CUIDADOR')")
    public ResponseEntity<String> aceptarInvitacion(@PathVariable Long relacionId) {
        try {
            cuidadorPacienteService.aceptarInvitacion(relacionId);
            return ResponseEntity.ok("Invitación aceptada");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/desvincular")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<String> desvincularCuidador(
            @RequestParam Long pacienteId,
            @RequestParam Long cuidadorId
    ) {
        try {
            cuidadorPacienteService.desvincularCuidador(pacienteId, cuidadorId);
            return ResponseEntity.ok("Cuidador desvinculado exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'CUIDADOR')")
    public ResponseEntity<List<CuidadorResponseDTO>> getCuidadoresPorPaciente(@PathVariable Long pacienteId) {
        List<CuidadorResponseDTO> cuidadores = cuidadorPacienteService.getCuidadoresPorPaciente(pacienteId);
        return ResponseEntity.ok(cuidadores);
    }
}
