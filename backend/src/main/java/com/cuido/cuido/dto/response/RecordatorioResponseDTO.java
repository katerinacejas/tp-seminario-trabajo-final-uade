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
public class RecordatorioResponseDTO {

    private Long id;
    private String tipo; // MEDICAMENTO o CITA_MEDICA
    private Long referenciaId;
    private Long pacienteId;
    private String pacienteNombre;
    private LocalDateTime fechaHora;
    private String estado; // PENDIENTE, COMPLETADO, CANCELADO
    private String descripcion;
    private String observaciones;

    // Campos específicos de medicamento (null si es cita)
    private String nombreMedicamento;
    private String dosis;

    // Campos específicos de cita médica (null si es medicamento)
    private String ubicacion;
    private String nombreDoctor;
    private String especialidad;
    private String motivo;
}
