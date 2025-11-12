package com.cuido.cuido.dto.request;

import com.cuido.cuido.model.Tarea;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TareaRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long pacienteId;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String descripcion;

    private LocalDateTime fechaVencimiento;

    private Tarea.Prioridad prioridad;

    private Boolean completada;
}
