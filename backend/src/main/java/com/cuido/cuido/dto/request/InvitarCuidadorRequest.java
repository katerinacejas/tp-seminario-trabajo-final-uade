package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InvitarCuidadorRequest {

    @NotBlank(message = "El email es requerido")
    @Email(message = "Email inválido")
    private String emailCuidador;
}
