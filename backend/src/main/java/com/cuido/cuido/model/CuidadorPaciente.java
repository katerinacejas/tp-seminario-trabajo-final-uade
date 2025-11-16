package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cuidadores_pacientes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"cuidador_id", "paciente_id"}),
    indexes = {
        @Index(name = "idx_cuidador", columnList = "cuidador_id"),
        @Index(name = "idx_paciente", columnList = "paciente_id"),
        @Index(name = "idx_estado", columnList = "estado")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuidadorPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuidador_id", nullable = false)
    private Usuario cuidador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @Column(name = "es_principal")
    private Boolean esPrincipal = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoRelacion estado = EstadoRelacion.PENDIENTE;

    @Column(name = "fecha_invitacion", nullable = false, updatable = false)
    private LocalDateTime fechaInvitacion;

    @Column(name = "fecha_aceptacion")
    private LocalDateTime fechaAceptacion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (fechaInvitacion == null) {
            fechaInvitacion = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Si el estado cambia a ACEPTADO y no tiene fecha de aceptación, setearla
        if (estado == EstadoRelacion.ACEPTADO && fechaAceptacion == null) {
            fechaAceptacion = LocalDateTime.now();
        }
    }

    public enum EstadoRelacion {
        PENDIENTE,  // Invitación enviada, esperando aceptación
        ACEPTADO,   // Cuidador aceptó y está activo
        RECHAZADO   // Cuidador rechazó la invitación
    }
}
