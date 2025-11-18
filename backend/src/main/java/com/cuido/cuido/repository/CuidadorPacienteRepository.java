package com.cuido.cuido.repository;

import com.cuido.cuido.model.CuidadorPaciente;
import com.cuido.cuido.model.CuidadorPaciente.EstadoRelacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CuidadorPacienteRepository extends JpaRepository<CuidadorPaciente, Long> {

    // Encuentra todas las relaciones de un cuidador
    List<CuidadorPaciente> findByCuidadorId(Long cuidadorId);

    // Encuentra todas las relaciones de un paciente
    List<CuidadorPaciente> findByPacienteId(Long pacienteId);

    // Encuentra relaciones por estado de un paciente
    List<CuidadorPaciente> findByPacienteIdAndEstado(Long pacienteId, EstadoRelacion estado);

    // Encuentra relaciones por estado de un cuidador
    List<CuidadorPaciente> findByCuidadorIdAndEstado(Long cuidadorId, EstadoRelacion estado);

    // Verifica si ya existe una relación entre cuidador y paciente
    Optional<CuidadorPaciente> findByCuidadorIdAndPacienteId(Long cuidadorId, Long pacienteId);

    // Cuenta cuántos cuidadores aceptados tiene un paciente
    @Query("SELECT COUNT(cp) FROM CuidadorPaciente cp WHERE cp.paciente.id = :pacienteId AND cp.estado = 'ACEPTADO'")
    Long countCuidadoresAceptadosByPaciente(@Param("pacienteId") Long pacienteId);
}
