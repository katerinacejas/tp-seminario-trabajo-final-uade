package com.cuido.cuido.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoResponseDTO {

    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long cuidadorId;
    private String cuidadorNombre;
    private String nombre;
    private String dosis;
    private String frecuencia;
    private String viaAdministracion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activo;
    private String observaciones;
    private List<HorarioDTO> horarios;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HorarioDTO {
        private Long id;
        private LocalTime hora;
        private String diasSemana;
    }
}
