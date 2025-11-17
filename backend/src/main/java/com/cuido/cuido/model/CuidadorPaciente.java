package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cuidador_paciente",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cuidador_id", "paciente_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuidadorPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cuidador_id", nullable = false)
    private Long cuidadorId;

    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "es_principal")
    private Boolean esPrincipal = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoVinculacion estado = EstadoVinculacion.PENDIENTE;

    @Column(name = "fecha_invitacion")
    private LocalDateTime fechaInvitacion;

    @Column(name = "fecha_aceptacion")
    private LocalDateTime fechaAceptacion;

    @PrePersist
    protected void onCreate() {
        if (fechaInvitacion == null) {
            fechaInvitacion = LocalDateTime.now();
        }
    }

    public enum EstadoVinculacion {
        PENDIENTE,
        ACEPTADO,
        RECHAZADO
    }
}
