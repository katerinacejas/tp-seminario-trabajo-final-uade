package com.cuido.cuido.dto.request;

import lombok.Data;
import java.sql.Date;

@Data
public class UsuarioUpdateRequestDTO {
    private String nombreCompleto;
    private String direccion;
    private int telefono;
    private Date fechaNacimiento;
    private String avatar;
}
