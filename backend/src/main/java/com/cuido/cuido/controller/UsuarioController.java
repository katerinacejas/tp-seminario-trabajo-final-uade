package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.CambiarPasswordRequest;
import com.cuido.cuido.dto.response.UsuarioResponseDTO;
import com.cuido.cuido.exception.UsuarioNotFoundException;
import com.cuido.cuido.dto.request.UsuarioUpdateRequestDTO;
import com.cuido.cuido.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;


@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

	/*
	 *  TODO: RE-ESCRIBIR LOS ROLES ADAPTADOS A CUIDO
	 */

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUIDADOR', 'PACIENTE', 'ADMIN')")
    public UsuarioResponseDTO getPerfilUsuarioAutenticado(Authentication auth) {
        String email = auth.getName();
        return usuarioService.getUsuarioPorMail(email)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado con email: " + email));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponseDTO> getTodosLosUsuarios() {
        return usuarioService.getTodosLosUsuarios();
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO getUsuarioPorMail(@RequestParam String mail) {
        return usuarioService.getUsuarioPorMail(mail)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado con email: " + mail));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioUpdateRequestDTO usuarioRequest) {
        return usuarioService.actualizarUsuario(id, usuarioRequest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return "Usuario eliminado con éxito.";
    }

    @PutMapping("/change-password")
    @PreAuthorize("hasAnyRole('CUIDADOR', 'PACIENTE', 'ADMIN')")
    public ResponseEntity<String> cambiarPassword(
            Authentication auth,
            @Valid @RequestBody CambiarPasswordRequest request
    ) {
        try {
            String email = auth.getName();
            usuarioService.cambiarPassword(email, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Contraseña actualizada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
