package com.cuido.cuido.controller;

import com.cuido.cuido.dto.request.DocumentoRequestDTO;
import com.cuido.cuido.dto.response.DocumentoResponseDTO;
import com.cuido.cuido.model.Documento;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.service.DocumentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documentos")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoService documentoService;

    /**
     * Subir un documento
     * POST /api/documentos
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoResponseDTO> subirDocumento(
        @RequestParam("archivo") MultipartFile archivo,
        @RequestParam("pacienteId") Long pacienteId,
        @RequestParam("nombre") String nombre,
        @RequestParam("tipo") Documento.TipoDocumento tipo,
        @RequestParam(value = "descripcion", required = false) String descripcion,
        Authentication authentication
    ) {
        try {
            Long cuidadorId = obtenerUsuarioIdDeAuthentication(authentication);

            DocumentoRequestDTO dto = new DocumentoRequestDTO();
            dto.setPacienteId(pacienteId);
            dto.setNombre(nombre);
            dto.setTipo(tipo);
            dto.setDescripcion(descripcion);

            DocumentoResponseDTO response = documentoService.subirDocumento(dto, archivo, cuidadorId);

            // Agregar URL de descarga
            response.setDownloadUrl("/api/documentos/" + response.getId() + "/descargar");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener todos los documentos de un paciente
     * GET /api/documentos/paciente/{pacienteId}
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<DocumentoResponseDTO>> getDocumentosByPaciente(
        @PathVariable Long pacienteId
    ) {
        List<DocumentoResponseDTO> documentos = documentoService.getDocumentosByPaciente(pacienteId);

        // Agregar URLs de descarga
        documentos.forEach(doc ->
            doc.setDownloadUrl("/api/documentos/" + doc.getId() + "/descargar")
        );

        return ResponseEntity.ok(documentos);
    }

    /**
     * Obtener fichas médicas de un paciente
     * GET /api/documentos/paciente/{pacienteId}/fichas
     */
    @GetMapping("/paciente/{pacienteId}/fichas")
    public ResponseEntity<List<DocumentoResponseDTO>> getFichasMedicas(
        @PathVariable Long pacienteId
    ) {
        List<DocumentoResponseDTO> fichas = documentoService.getFichasMedicas(pacienteId);

        fichas.forEach(doc ->
            doc.setDownloadUrl("/api/documentos/" + doc.getId() + "/descargar")
        );

        return ResponseEntity.ok(fichas);
    }

    /**
     * Obtener otros documentos (no fichas) de un paciente
     * GET /api/documentos/paciente/{pacienteId}/otros
     */
    @GetMapping("/paciente/{pacienteId}/otros")
    public ResponseEntity<List<DocumentoResponseDTO>> getOtrosDocumentos(
        @PathVariable Long pacienteId
    ) {
        List<DocumentoResponseDTO> otros = documentoService.getOtrosDocumentos(pacienteId);

        otros.forEach(doc ->
            doc.setDownloadUrl("/api/documentos/" + doc.getId() + "/descargar")
        );

        return ResponseEntity.ok(otros);
    }

    /**
     * Filtrar documentos por categoría
     * GET /api/documentos/paciente/{pacienteId}/categoria/{categoria}
     */
    @GetMapping("/paciente/{pacienteId}/categoria/{categoria}")
    public ResponseEntity<List<DocumentoResponseDTO>> getDocumentosPorCategoria(
        @PathVariable Long pacienteId,
        @PathVariable Documento.CategoriaArchivo categoria
    ) {
        List<DocumentoResponseDTO> documentos = documentoService.getDocumentosPorCategoria(pacienteId, categoria);

        documentos.forEach(doc ->
            doc.setDownloadUrl("/api/documentos/" + doc.getId() + "/descargar")
        );

        return ResponseEntity.ok(documentos);
    }

    /**
     * Obtener un documento por ID
     * GET /api/documentos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentoResponseDTO> getDocumentoById(@PathVariable Long id) {
        DocumentoResponseDTO documento = documentoService.getDocumentoById(id);
        documento.setDownloadUrl("/api/documentos/" + documento.getId() + "/descargar");
        return ResponseEntity.ok(documento);
    }

    /**
     * Descargar archivo
     * GET /api/documentos/{id}/descargar
     */
    @GetMapping("/{id}/descargar")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable Long id) {
        try {
            DocumentoResponseDTO documento = documentoService.getDocumentoById(id);
            Resource resource = documentoService.descargarArchivo(id);

            // Determinar si el archivo debe mostrarse inline (PDFs, imágenes) o descargarse
            String contentDisposition = "attachment";
            if (documento.getMimeType().equals("application/pdf") ||
                documento.getMimeType().startsWith("image/")) {
                contentDisposition = "inline";
            }

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(documento.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    contentDisposition + "; filename=\"" + documento.getNombre() + "\"")
                .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Eliminar documento
     * DELETE /api/documentos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDocumento(@PathVariable Long id) {
        try {
            documentoService.eliminarDocumento(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Helper: Obtener usuario ID de autenticación
     */
    private Long obtenerUsuarioIdDeAuthentication(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return usuario.getId();
    }
}
