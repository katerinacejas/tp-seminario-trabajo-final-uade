package com.cuido.cuido.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitaMedicaRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long pacienteId;

    @NotNull(message = "La fecha y hora son obligatorias")
    @Future(message = "La fecha de la cita debe ser futura")
    private LocalDateTime fechaHora;

    @Size(max = 500, message = "La ubicación no puede exceder 500 caracteres")
    private String ubicacion;

    @Size(max = 255, message = "El nombre del doctor no puede exceder 255 caracteres")
    private String nombreDoctor;

    @Size(max = 255, message = "La especialidad no puede exceder 255 caracteres")
    private String especialidad;

    @Size(max = 500, message = "El motivo no puede exceder 500 caracteres")
    private String motivo;

    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String observaciones;
}
