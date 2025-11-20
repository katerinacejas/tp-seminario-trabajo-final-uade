package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recordatorios_instancia", indexes = {
    @Index(name = "idx_paciente_fecha", columnList = "paciente_id, fecha_hora"),
    @Index(name = "idx_tipo_referencia", columnList = "tipo, referencia_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordatorioInstancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoRecordatorio tipo;

    @Column(name = "referencia_id", nullable = false)
    private Long referenciaId; // medicamento_id o cita_medica_id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoRecordatorio estado = EstadoRecordatorio.PENDIENTE;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

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

    public enum TipoRecordatorio {
        MEDICAMENTO,
        CITA_MEDICA
    }

    public enum EstadoRecordatorio {
        PENDIENTE,
        COMPLETADO,
        CANCELADO
    }
}
