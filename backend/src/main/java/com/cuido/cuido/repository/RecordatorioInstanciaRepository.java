package com.cuido.cuido.repository;

import com.cuido.cuido.model.RecordatorioInstancia;
import com.cuido.cuido.model.RecordatorioInstancia.EstadoRecordatorio;
import com.cuido.cuido.model.RecordatorioInstancia.TipoRecordatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecordatorioInstanciaRepository extends JpaRepository<RecordatorioInstancia, Long> {

    List<RecordatorioInstancia> findByPacienteIdOrderByFechaHoraAsc(Long pacienteId);

    List<RecordatorioInstancia> findByPacienteIdAndFechaHoraBetweenOrderByFechaHoraAsc(
        Long pacienteId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    );

    List<RecordatorioInstancia> findByPacienteIdAndEstadoOrderByFechaHoraAsc(
        Long pacienteId,
        EstadoRecordatorio estado
    );

    @Query("SELECT r FROM RecordatorioInstancia r WHERE r.paciente.id = :pacienteId " +
           "AND r.fechaHora >= :fechaInicio AND r.fechaHora < :fechaFin " +
           "ORDER BY r.fechaHora ASC")
    List<RecordatorioInstancia> findRecordatoriosDelDia(
        @Param("pacienteId") Long pacienteId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    List<RecordatorioInstancia> findByTipoAndReferenciaId(TipoRecordatorio tipo, Long referenciaId);

    void deleteByTipoAndReferenciaId(TipoRecordatorio tipo, Long referenciaId);
}
