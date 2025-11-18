package com.cuido.cuido.dto.response;

import com.cuido.cuido.model.Documento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentoResponseDTO {

    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long cuidadorId;
    private String cuidadorNombre;
    private String nombre;
    private Documento.TipoDocumento tipo;
    private Documento.CategoriaArchivo categoriaArchivo;
    private Long sizeBytes;
    private String mimeType;
    private String descripcion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Extension del archivo (derivado del nombre)
    private String extension;

    // URL para descarga (se construye en el controller)
    private String downloadUrl;
}
