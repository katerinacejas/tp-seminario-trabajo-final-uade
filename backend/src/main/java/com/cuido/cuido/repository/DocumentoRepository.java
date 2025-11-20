package com.cuido.cuido.repository;

import com.cuido.cuido.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    // Obtener todos los documentos de un paciente (ordenados por fecha descendente)
    List<Documento> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId);

    // Obtener documentos de un paciente filtrados por tipo (Ficha Médica vs Otros)
    List<Documento> findByPacienteIdAndTipoOrderByCreatedAtDesc(Long pacienteId, Documento.TipoDocumento tipo);

    // Obtener documentos de un paciente filtrados por categoría de archivo (Documento, Imagen, Video)
    List<Documento> findByPacienteIdAndCategoriaArchivoOrderByCreatedAtDesc(
        Long pacienteId,
        Documento.CategoriaArchivo categoriaArchivo
    );

    // Obtener todos los documentos de tipo FICHA_MEDICA de un paciente
    @Query("SELECT d FROM Documento d WHERE d.paciente.id = :pacienteId AND d.tipo = 'FICHA_MEDICA' ORDER BY d.createdAt DESC")
    List<Documento> findFichasMedicasByPacienteId(@Param("pacienteId") Long pacienteId);

    // Obtener todos los documentos que NO son FICHA_MEDICA de un paciente
    @Query("SELECT d FROM Documento d WHERE d.paciente.id = :pacienteId AND d.tipo <> 'FICHA_MEDICA' ORDER BY d.createdAt DESC")
    List<Documento> findOtrosDocumentosByPacienteId(@Param("pacienteId") Long pacienteId);

    // Obtener documentos creados por un cuidador específico
    List<Documento> findByCuidadorIdOrderByCreatedAtDesc(Long cuidadorId);

    // Contar documentos por paciente
    Long countByPacienteId(Long pacienteId);
}
