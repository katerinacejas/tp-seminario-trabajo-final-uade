package com.cuido.cuido.repository;

import com.cuido.cuido.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    // Obtener todas las tareas de un paciente ordenadas por orden manual
    List<Tarea> findByPacienteIdOrderByOrdenManualAsc(Long pacienteId);

    // Obtener tareas completadas/pendientes de un paciente
    List<Tarea> findByPacienteIdAndCompletadaOrderByOrdenManualAsc(Long pacienteId, Boolean completada);

    // Obtener tareas por paciente en un rango de fechas
    @Query("SELECT t FROM Tarea t WHERE t.paciente.id = :pacienteId " +
           "AND t.fechaVencimiento BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY t.ordenManual ASC")
    List<Tarea> findByPacienteIdAndFechaVencimientoBetween(
        @Param("pacienteId") Long pacienteId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    // Obtener tareas creadas por un cuidador
    List<Tarea> findByCuidadorIdOrderByCreatedAtDesc(Long cuidadorId);

    // Contar tareas por paciente
    Long countByPacienteId(Long pacienteId);

    // Contar tareas pendientes por paciente
    Long countByPacienteIdAndCompletada(Long pacienteId, Boolean completada);

    // Obtener el máximo orden manual para un paciente (para agregar al final)
    @Query("SELECT COALESCE(MAX(t.ordenManual), 0) FROM Tarea t WHERE t.paciente.id = :pacienteId")
    Integer findMaxOrdenManualByPacienteId(@Param("pacienteId") Long pacienteId);
}
