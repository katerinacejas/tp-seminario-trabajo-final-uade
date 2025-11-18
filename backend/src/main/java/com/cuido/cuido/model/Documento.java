package com.cuido.cuido.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documentos", indexes = {
    @Index(name = "idx_paciente_tipo", columnList = "paciente_id, tipo"),
    @Index(name = "idx_paciente_categoria", columnList = "paciente_id, categoria_archivo"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuidador_id", nullable = false)
    private Usuario cuidador;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoDocumento tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria_archivo", nullable = false)
    private CategoriaArchivo categoriaArchivo;

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

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
    }

    // Enums
    public enum TipoDocumento {
        FICHA_MEDICA,
        ESTUDIO,
        RECETA,
        OTRO
    }

    public enum CategoriaArchivo {
        DOCUMENTO,  // PDF, DOC, DOCX
        IMAGEN,     // PNG, JPG, JPEG
        VIDEO       // MP4, AVI
    }
}
