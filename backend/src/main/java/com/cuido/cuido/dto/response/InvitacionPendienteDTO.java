package com.cuido.cuido.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InvitacionPendienteDTO {
    private Long id;
    private Long pacienteId;
    private String nombreCompletoPaciente;
    private String emailPaciente;
    private LocalDateTime fechaInvitacion;
}
