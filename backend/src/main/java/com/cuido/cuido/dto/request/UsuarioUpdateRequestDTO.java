package com.backend_ecommerce_api.backend_ecommerce_api.dto.request;

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
