package com.cuido.cuido.dto.request;

import com.cuido.cuido.model.Documento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long pacienteId;

    @NotBlank(message = "El nombre del documento es obligatorio")
    private String nombre;

    @NotNull(message = "El tipo de documento es obligatorio")
    private Documento.TipoDocumento tipo;

    private String descripcion;

    // Los campos de archivo (ruta, tamaño, mime type, categoría) se setean en el service al procesar el MultipartFile
}
