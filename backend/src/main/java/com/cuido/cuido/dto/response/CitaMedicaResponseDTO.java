package com.cuido.cuido.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitaMedicaResponseDTO {

    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long cuidadorId;
    private String cuidadorNombre;
    private LocalDateTime fechaHora;
    private String ubicacion;
    private String nombreDoctor;
    private String especialidad;
    private String motivo;
    private String observaciones;
    private Boolean completada;
    private LocalDateTime createdAt;
}
