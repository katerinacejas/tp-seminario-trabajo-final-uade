package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarEstadoRecordatorioRequestDTO {

    @NotNull(message = "El estado es obligatorio")
    private String estado; // PENDIENTE, COMPLETADO, CANCELADO
}
