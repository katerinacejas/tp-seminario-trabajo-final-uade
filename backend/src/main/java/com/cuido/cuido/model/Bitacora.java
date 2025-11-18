package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bitacoras", indexes = {
    @Index(name = "idx_paciente_fecha", columnList = "paciente_id, fecha")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bitacora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuidador_id", nullable = false)
    private Usuario cuidador;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;  // Auto: "Bitácora del DD/MM/YYYY" o manual

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;  // Actividades realizadas

    @Column(name = "sintomas", length = 500)
    private String sintomas;  // Texto libre OPCIONAL

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;  // Notas adicionales

    @Column(name = "created_at", updatable = false)
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
    }
}
