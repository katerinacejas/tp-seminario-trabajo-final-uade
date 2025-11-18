package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tareas", indexes = {
    @Index(name = "idx_paciente_orden", columnList = "paciente_id, orden_manual")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuidador_id", nullable = false)
    private Usuario cuidador;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad", nullable = false)
    private Prioridad prioridad = Prioridad.MEDIA;

    @Column(name = "completada", nullable = false)
    private Boolean completada = false;

    @Column(name = "fecha_completada")
    private LocalDateTime fechaCompletada;

    @Column(name = "orden_manual", nullable = false)
    private Integer ordenManual = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();

        // Si se marca como completada, guardar fecha de completado
        if (completada && fechaCompletada == null) {
            fechaCompletada = LocalDateTime.now();
        }
        // Si se desmarca, limpiar fecha de completado
        if (!completada && fechaCompletada != null) {
            fechaCompletada = null;
        }
    }

    // Enum de Prioridad
    public enum Prioridad {
        BAJA,
        MEDIA,
        ALTA
    }
}
