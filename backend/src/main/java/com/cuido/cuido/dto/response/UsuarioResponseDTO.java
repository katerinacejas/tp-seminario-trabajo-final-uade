package com.cuido.cuido.dto.response;

import lombok.Data;
import java.sql.Date;

@Data
public class UsuarioResponseDTO {
    private Long id;
    private String nombreCompleto;
    private String direccion;
    private String telefono;
    private Date fechaNacimiento;
    private String avatar;
    private String email;
}
