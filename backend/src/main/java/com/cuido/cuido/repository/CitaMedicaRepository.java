package com.cuido.cuido.repository;

import com.cuido.cuido.model.CitaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaMedicaRepository extends JpaRepository<CitaMedica, Long> {

    List<CitaMedica> findByPacienteIdOrderByFechaHoraAsc(Long pacienteId);

    List<CitaMedica> findByPacienteIdAndFechaHoraBetweenOrderByFechaHoraAsc(
        Long pacienteId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    );

    List<CitaMedica> findByCuidadorIdOrderByFechaHoraDesc(Long cuidadorId);
}
