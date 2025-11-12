package com.cuido.cuido.controller;

import com.cuido.cuido.dto.response.UsuarioResponseDTO;
import com.cuido.cuido.exception.ResourceNotFoundException;
import com.cuido.cuido.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para operaciones relacionadas con pacientes.
 * Utilizado principalmente por el chatbot.
 */
@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    /**
     * Busca pacientes por nombre (parcial o completo).
     * Solo CUIDADORES pueden buscar pacientes.
     *
     * @param nombre Nombre del paciente a buscar
     * @param auth Usuario autenticado
     * @return Lista de pacientes que coinciden con el nombre
     */
    @GetMapping("/buscar")
    @PreAuthorize("hasRole('CUIDADOR')")
    public List<UsuarioResponseDTO> buscarPacientesPorNombre(
            @RequestParam String nombre,
            Authentication auth
    ) {
        return pacienteService.buscarPacientesPorNombre(nombre);
    }

    /**
     * Obtiene un paciente por su ID.
     *
     * @param id ID del paciente
     * @return Datos del paciente
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUIDADOR', 'ADMIN')")
    public UsuarioResponseDTO obtenerPacientePorId(@PathVariable Long id) {
        return pacienteService.obtenerPacientePorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con ID: " + id));
    }

    /**
     * Verifica si un cuidador tiene acceso a un paciente específico.
     *
     * @param pacienteId ID del paciente
     * @param auth Usuario autenticado (cuidador)
     * @return true si tiene acceso, false en caso contrario
     */
    @GetMapping("/{pacienteId}/verificar-acceso")
    @PreAuthorize("hasRole('CUIDADOR')")
    public boolean verificarAcceso(
            @PathVariable Long pacienteId,
            Authentication auth
    ) {
        String email = auth.getName();
        return pacienteService.verificarAccesoCuidador(email, pacienteId);
    }

    /**
     * Obtiene todos los pacientes vinculados a un cuidador.
     *
     * @param auth Usuario autenticado (cuidador)
     * @return Lista de pacientes del cuidador
     */
    @GetMapping("/mis-pacientes")
    @PreAuthorize("hasRole('CUIDADOR')")
    public List<UsuarioResponseDTO> obtenerMisPacientes(Authentication auth) {
        String email = auth.getName();
        return pacienteService.obtenerPacientesDelCuidador(email);
    }
}
