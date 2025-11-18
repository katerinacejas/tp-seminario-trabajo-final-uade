package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {

    @NotBlank(message = "El código OTP es requerido")
    @Size(min = 6, max = 6, message = "El código OTP debe tener 6 dígitos")
    private String codigoOtp;

    @NotBlank(message = "La nueva contraseña es requerida")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String nuevaPassword;
}
