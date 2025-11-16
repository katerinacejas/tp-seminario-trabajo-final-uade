package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Data
@Entity
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "tipo_sanguineo")
    private String tipoSanguineo;

    @Column(precision = 5, scale = 2)
    private Double peso;

    @Column(precision = 5, scale = 2)
    private Double altura;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    // Condiciones médicas ahora como JSON array
    @Column(name = "condiciones_medicas", columnDefinition = "TEXT")
    private String condicionesMedicasJson;

    @Transient
    private List<String> condicionesMedicas = new ArrayList<>();

    // Notas importantes ahora como JSON array
    @Column(name = "notas_importantes", columnDefinition = "TEXT")
    private String notasImportantesJson;

    @Transient
    private List<String> notasImportantes = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "obra_social")
    private String obraSocial;

    @Column(name = "numero_afiliado", length = 100)
    private String numeroAfiliado;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        serializeArrays();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        serializeArrays();
    }

    @PostLoad
    protected void deserializeArrays() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            if (condicionesMedicasJson != null && !condicionesMedicasJson.isEmpty()) {
                condicionesMedicas = mapper.readValue(condicionesMedicasJson, new TypeReference<List<String>>() {});
            }
            if (notasImportantesJson != null && !notasImportantesJson.isEmpty()) {
                notasImportantes = mapper.readValue(notasImportantesJson, new TypeReference<List<String>>() {});
            }
        } catch (JsonProcessingException e) {
            condicionesMedicas = new ArrayList<>();
            notasImportantes = new ArrayList<>();
        }
    }

    private void serializeArrays() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            condicionesMedicasJson = (condicionesMedicas != null && !condicionesMedicas.isEmpty())
                ? mapper.writeValueAsString(condicionesMedicas)
                : null;
            notasImportantesJson = (notasImportantes != null && !notasImportantes.isEmpty())
                ? mapper.writeValueAsString(notasImportantes)
                : null;
        } catch (JsonProcessingException e) {
            // Mantener valores anteriores si hay error
        }
    }
}
