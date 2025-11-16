package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.ContactoEmergenciaRequest;
import com.cuido.cuido.dto.response.ContactoEmergenciaResponseDTO;
import com.cuido.cuido.service.ContactoEmergenciaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contactos-emergencia")
public class ContactoEmergenciaController {

    private final ContactoEmergenciaService contactoService;

    @Autowired
    public ContactoEmergenciaController(ContactoEmergenciaService contactoService) {
        this.contactoService = contactoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<ContactoEmergenciaResponseDTO> crear(
            @RequestParam Long pacienteId,
            @Valid @RequestBody ContactoEmergenciaRequest request
    ) {
        ContactoEmergenciaResponseDTO contacto = contactoService.crear(pacienteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contacto);
    }

    @PutMapping("/{contactoId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<ContactoEmergenciaResponseDTO> actualizar(
            @PathVariable Long contactoId,
            @Valid @RequestBody ContactoEmergenciaRequest request
    ) {
        ContactoEmergenciaResponseDTO contacto = contactoService.actualizar(contactoId, request);
        return ResponseEntity.ok(contacto);
    }

    @DeleteMapping("/{contactoId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<Void> eliminar(@PathVariable Long contactoId) {
        contactoService.eliminar(contactoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'CUIDADOR')")
    public ResponseEntity<List<ContactoEmergenciaResponseDTO>> getByPaciente(@PathVariable Long pacienteId) {
        List<ContactoEmergenciaResponseDTO> contactos = contactoService.getByPaciente(pacienteId);
        return ResponseEntity.ok(contactos);
    }
}
