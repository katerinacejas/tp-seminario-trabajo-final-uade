package com.cuido.cuido.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BitacoraResponseDTO {

    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long cuidadorId;
    private String cuidadorNombre;
    private LocalDate fecha;
    private String titulo;
    private String descripcion;  // Actividades realizadas
    private String sintomas;     // Texto libre
    private String observaciones; // Notas adicionales
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
