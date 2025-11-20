package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.sql.Date;

@Data
public class RegistroRequestDTO {
    @NotBlank(message = "El nombre completo es requerido")
    @Size(max = 255, message = "El nombre completo no puede exceder 255 caracteres")
    private String nombreCompleto;

    @Size(max = 500, message = "La dirección no puede exceder 500 caracteres")
    private String direccion;

    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefono;

    private Date fechaNacimiento;

    @Size(max = 500, message = "La URL del avatar no puede exceder 500 caracteres")
    private String avatar;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe ser válido")
    @Size(max = 255, message = "El email no puede exceder 255 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;

    @NotBlank(message = "El rol es requerido")
    private String rol;
}
