package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BitacoraRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long pacienteId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    private String titulo;  // Opcional - se auto-genera si es null

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;  // Actividades realizadas

    private String sintomas;  // Opcional - texto libre

    private String observaciones;  // Notas adicionales
}
