package com.cuido.cuido.repository;

import com.cuido.cuido.model.Bitacora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BitacoraRepository extends JpaRepository<Bitacora, Long> {

    List<Bitacora> findByPacienteIdOrderByFechaDescCreatedAtDesc(Long pacienteId);

    List<Bitacora> findByPacienteIdAndFechaBetweenOrderByFechaDescCreatedAtDesc(
        Long pacienteId,
        LocalDate fechaInicio,
        LocalDate fechaFin
    );

    List<Bitacora> findByCuidadorIdOrderByFechaDesc(Long cuidadorId);

    @Query("SELECT b FROM Bitacora b WHERE b.paciente.id = :pacienteId AND b.fecha = :fecha ORDER BY b.createdAt ASC")
    List<Bitacora> findByPacienteIdAndFechaOrderByCreatedAtAsc(
        @Param("pacienteId") Long pacienteId,
        @Param("fecha") LocalDate fecha
    );

    Long countByPacienteIdAndFecha(Long pacienteId, LocalDate fecha);
}
