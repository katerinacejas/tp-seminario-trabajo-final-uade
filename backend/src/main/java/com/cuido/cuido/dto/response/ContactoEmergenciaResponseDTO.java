package com.cuido.cuido.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactoEmergenciaResponseDTO {
    private Long id;
    private String nombre;
    private String telefono;
    private String relacion;
    private String email;
    private Boolean esContactoPrincipal;
}
