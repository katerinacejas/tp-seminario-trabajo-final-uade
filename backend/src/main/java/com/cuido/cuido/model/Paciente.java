package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", unique = true, nullable = false)
    private Long usuarioId;

    @Column(name = "tipo_sanguineo", length = 10)
    private String tipoSanguineo;

    @Column(precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(precision = 5, scale = 2)
    private BigDecimal altura;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "condiciones_medicas", columnDefinition = "TEXT")
    private String condicionesMedicas;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "obra_social")
    private String obraSocial;

    @Column(name = "numero_afiliado", length = 100)
    private String numeroAfiliado;

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
