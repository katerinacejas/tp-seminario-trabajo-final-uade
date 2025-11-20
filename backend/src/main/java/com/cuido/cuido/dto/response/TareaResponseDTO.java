package com.cuido.cuido.dto.response;

import com.cuido.cuido.model.Tarea;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TareaResponseDTO {

    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long cuidadorId;
    private String cuidadorNombre;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaVencimiento;
    private Tarea.Prioridad prioridad;
    private Boolean completada;
    private LocalDateTime fechaCompletada;
    private Integer ordenManual;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper para frontend: indica si está vencida
    private Boolean vencida;
}
