package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.DocumentoRequestDTO;
import com.cuido.cuido.dto.response.DocumentoResponseDTO;
import com.cuido.cuido.exception.InvalidFileException;
import com.cuido.cuido.model.Documento;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.DocumentoRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentoService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoService.class);

    private final DocumentoRepository documentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthorizationService authorizationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final long MAX_FILE_SIZE_INDIVIDUAL = 50 * 1024 * 1024; // 50MB por archivo

    // Mapeo de extensiones a MIME types
    private static final Map<String, String> EXTENSION_TO_MIME = new HashMap<>() {{
        // Documentos
        put("pdf", "application/pdf");
        put("doc", "application/msword");
        put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        // Imágenes
        put("png", "image/png");
        put("jpg", "image/jpeg");
        put("jpeg", "image/jpeg");
        // Videos
        put("mp4", "video/mp4");
        put("avi", "video/x-msvideo");
    }};

    // Mapeo de MIME types a categorías
    private static final Map<String, Documento.CategoriaArchivo> MIME_TO_CATEGORIA = new HashMap<>() {{
        put("application/pdf", Documento.CategoriaArchivo.DOCUMENTO);
        put("application/msword", Documento.CategoriaArchivo.DOCUMENTO);
        put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", Documento.CategoriaArchivo.DOCUMENTO);
        put("image/png", Documento.CategoriaArchivo.IMAGEN);
        put("image/jpeg", Documento.CategoriaArchivo.IMAGEN);
        put("video/mp4", Documento.CategoriaArchivo.VIDEO);
        put("video/x-msvideo", Documento.CategoriaArchivo.VIDEO);
    }};

    /**
     * Subir un documento
     */
    @Transactional
    public DocumentoResponseDTO subirDocumento(
        DocumentoRequestDTO dto,
        MultipartFile archivo,
        Long cuidadorId
    ) throws IOException {
        logger.info("Solicitud de subida de documento - Paciente ID: {}, Cuidador ID: {}, Tipo: {}",
                   dto.getPacienteId(), cuidadorId, dto.getTipo());

        // Validar acceso al paciente
        ////authorizationService.validarAccesoAPaciente(dto.getPacienteId());

        // Validaciones de archivo
        if (archivo.isEmpty()) {
            logger.warn("Intento de subir archivo vacío - Paciente ID: {}", dto.getPacienteId());
            throw new InvalidFileException("El archivo está vacío");
        }

        if (archivo.getSize() > MAX_FILE_SIZE_INDIVIDUAL) {
            logger.warn("Archivo rechazado por tamaño excesivo: {} bytes - Paciente ID: {}",
                       archivo.getSize(), dto.getPacienteId());
            throw new InvalidFileException("El archivo excede el tamaño máximo permitido de 50MB");
        }

        String originalFilename = archivo.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            logger.warn("Nombre de archivo inválido - Paciente ID: {}", dto.getPacienteId());
            throw new InvalidFileException("Nombre de archivo inválido");
        }

        // Validar nombre de archivo para prevenir path traversal
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            logger.warn("SECURITY: Intento de path traversal detectado - Filename: {} - Paciente ID: {}",
                       originalFilename, dto.getPacienteId());
            throw new InvalidFileException("Nombre de archivo inválido");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

        if (!EXTENSION_TO_MIME.containsKey(extension)) {
            logger.warn("Extensión de archivo no soportada: {} - Paciente ID: {}", extension, dto.getPacienteId());
            throw new InvalidFileException(
                "Tipo de archivo no soportado. Formatos permitidos: PDF, DOC, DOCX, PNG, JPG, JPEG, MP4, AVI"
            );
        }

        // Validar MIME type real del archivo (magic bytes)
        String detectedMimeType = Files.probeContentType(Paths.get(originalFilename));
        String expectedMimeType = EXTENSION_TO_MIME.get(extension);

        // Si no se puede detectar o no coincide con la extensión, rechazar
        if (detectedMimeType != null && !detectedMimeType.startsWith(expectedMimeType.split("/")[0])) {
            logger.warn("SECURITY: MIME type mismatch - Detected: {}, Expected: {} - Filename: {}",
                       detectedMimeType, expectedMimeType, originalFilename);
            throw new InvalidFileException("El contenido del archivo no coincide con su extensión");
        }

        // Obtener usuario paciente y cuidador
        Usuario paciente = usuarioRepository.findById(dto.getPacienteId())
            .orElseThrow(() -> new com.cuido.cuido.exception.ResourceNotFoundException("Paciente no encontrado"));

        Usuario cuidador = usuarioRepository.findById(cuidadorId)
            .orElseThrow(() -> new com.cuido.cuido.exception.ResourceNotFoundException("Cuidador no encontrado"));

        // Determinar carpeta de destino según tipo
        String carpetaTipo = dto.getTipo() == Documento.TipoDocumento.FICHA_MEDICA ? "fichas" : "documentos";

        // Ruta: uploads/{carpetaTipo}/{pacienteId}/
        Path directorioDestino = Paths.get(uploadDir, carpetaTipo, paciente.getId().toString());

        // Crear directorio si no existe
        if (!Files.exists(directorioDestino)) {
            Files.createDirectories(directorioDestino);
        }

        // Generar nombre único para el archivo
        String nombreUnico = UUID.randomUUID().toString() + "_" + originalFilename;
        Path archivoDestino = directorioDestino.resolve(nombreUnico);

        // Copiar archivo
        Files.copy(archivo.getInputStream(), archivoDestino, StandardCopyOption.REPLACE_EXISTING);
        logger.info("Archivo guardado exitosamente - Path: {} - Size: {} bytes", archivoDestino, archivo.getSize());

        // Crear entidad Documento
        Documento documento = new Documento();
        documento.setPaciente(paciente);
        documento.setCuidador(cuidador);
        documento.setNombre(dto.getNombre());
        documento.setTipo(dto.getTipo());
        documento.setDescripcion(dto.getDescripcion());
        documento.setRutaArchivo(archivoDestino.toString());
        documento.setSizeBytes(archivo.getSize());

        String mimeType = EXTENSION_TO_MIME.get(extension);
        documento.setMimeType(mimeType);
        documento.setCategoriaArchivo(MIME_TO_CATEGORIA.get(mimeType));

        documento = documentoRepository.save(documento);
        logger.info("Documento registrado en BD - ID: {}, Paciente ID: {}, Tipo: {}",
                   documento.getId(), dto.getPacienteId(), dto.getTipo());

        return convertirADTO(documento);
    }

    /**
     * Obtener todos los documentos de un paciente
     */
    @Transactional(readOnly = true)
    public List<DocumentoResponseDTO> getDocumentosByPaciente(Long pacienteId) {
        ////authorizationService.validarAccesoAPaciente(pacienteId);
        List<Documento> documentos = documentoRepository.findByPacienteIdOrderByCreatedAtDesc(pacienteId);
        return documentos.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener fichas médicas de un paciente
     */
    @Transactional(readOnly = true)
    public List<DocumentoResponseDTO> getFichasMedicas(Long pacienteId) {
        ////authorizationService.validarAccesoAPaciente(pacienteId);
        List<Documento> fichas = documentoRepository.findFichasMedicasByPacienteId(pacienteId);
        return fichas.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener otros documentos (no fichas médicas) de un paciente
     */
    @Transactional(readOnly = true)
    public List<DocumentoResponseDTO> getOtrosDocumentos(Long pacienteId) {
        ////authorizationService.validarAccesoAPaciente(pacienteId);
        List<Documento> otros = documentoRepository.findOtrosDocumentosByPacienteId(pacienteId);
        return otros.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Filtrar documentos por categoría de archivo
     */
    @Transactional(readOnly = true)
    public List<DocumentoResponseDTO> getDocumentosPorCategoria(
        Long pacienteId,
        Documento.CategoriaArchivo categoria
    ) {
        ////authorizationService.validarAccesoAPaciente(pacienteId);
        List<Documento> documentos = documentoRepository
            .findByPacienteIdAndCategoriaArchivoOrderByCreatedAtDesc(pacienteId, categoria);
        return documentos.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener un documento por ID
     */
    @Transactional(readOnly = true)
    public DocumentoResponseDTO getDocumentoById(Long documentoId) {
        Documento documento = documentoRepository.findById(documentoId)
            .orElseThrow(() -> new com.cuido.cuido.exception.ResourceNotFoundException("Documento no encontrado"));

        // Validar acceso al paciente del documento
        ////authorizationService.validarAccesoAPaciente(documento.getPaciente().getId());

        return convertirADTO(documento);
    }

    /**
     * Descargar archivo
     */
    public Resource descargarArchivo(Long documentoId) throws IOException {
        Documento documento = documentoRepository.findById(documentoId)
            .orElseThrow(() -> new com.cuido.cuido.exception.ResourceNotFoundException("Documento no encontrado"));

        // Validar acceso al paciente del documento
        ////authorizationService.validarAccesoAPaciente(documento.getPaciente().getId());

        Path archivoPath = Paths.get(documento.getRutaArchivo());

        // Validar que la ruta no intente acceder fuera del directorio de uploads
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path resolvedPath = archivoPath.toAbsolutePath().normalize();

        if (!resolvedPath.startsWith(uploadPath)) {
            throw new com.cuido.cuido.exception.AccessDeniedException("Acceso denegado al archivo");
        }

        Resource resource = new UrlResource(resolvedPath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new com.cuido.cuido.exception.ResourceNotFoundException("No se pudo leer el archivo: " + documento.getNombre());
        }
    }

    /**
     * Eliminar documento
     */
    @Transactional
    public void eliminarDocumento(Long documentoId) throws IOException {
        Documento documento = documentoRepository.findById(documentoId)
            .orElseThrow(() -> new com.cuido.cuido.exception.ResourceNotFoundException("Documento no encontrado"));

        // Validar acceso al paciente del documento
        ////authorizationService.validarAccesoAPaciente(documento.getPaciente().getId());

        // Eliminar archivo físico
        Path archivoPath = Paths.get(documento.getRutaArchivo());
        if (Files.exists(archivoPath)) {
            Files.delete(archivoPath);
        }

        // Eliminar registro de BD
        documentoRepository.delete(documento);
    }

    /**
     * Convertir entidad a DTO
     */
    private DocumentoResponseDTO convertirADTO(Documento documento) {
        String extension = "";
        String nombreArchivo = documento.getRutaArchivo();
        if (nombreArchivo.contains(".")) {
            extension = nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toUpperCase();
        }

        return DocumentoResponseDTO.builder()
            .id(documento.getId())
            .pacienteId(documento.getPaciente().getId())
            .pacienteNombre(documento.getPaciente().getNombreCompleto())
            .cuidadorId(documento.getCuidador().getId())
            .cuidadorNombre(documento.getCuidador().getNombreCompleto())
            .nombre(documento.getNombre())
            .tipo(documento.getTipo())
            .categoriaArchivo(documento.getCategoriaArchivo())
            .sizeBytes(documento.getSizeBytes())
            .mimeType(documento.getMimeType())
            .descripcion(documento.getDescripcion())
            .createdAt(documento.getCreatedAt())
            .updatedAt(documento.getUpdatedAt())
            .extension(extension)
            .build();
    }

    /**
     * Formatear tamaño de archivo
     */
    public static String formatearTamano(Long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
