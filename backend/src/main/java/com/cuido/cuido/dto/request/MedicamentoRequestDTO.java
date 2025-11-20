package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentoRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long pacienteId;

    @NotBlank(message = "El nombre del medicamento es obligatorio")
    private String nombre;

    private String dosis;

    private String frecuencia;

    private String viaAdministracion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    private String observaciones;

    @NotNull(message = "Los horarios son obligatorios")
    private List<HorarioDTO> horarios;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HorarioDTO {
        @NotNull(message = "La hora es obligatoria")
        private LocalTime hora;

        private String diasSemana; // JSON: ["L","M","X","J","V","S","D"] o null para diario
    }
}
