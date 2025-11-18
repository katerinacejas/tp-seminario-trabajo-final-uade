package com.cuido.cuido.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuidadorResponseDTO {
    private Long id;
    private Long usuarioId;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String estado; // PENDIENTE, ACEPTADO, RECHAZADO
    private Boolean esPrincipal;
    private LocalDateTime fechaInvitacion;
    private LocalDateTime fechaAceptacion;
}
