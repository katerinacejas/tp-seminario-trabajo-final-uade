package com.cuido.cuido.repository;

import com.cuido.cuido.model.CuidadorPaciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CuidadorPacienteRepository extends JpaRepository<CuidadorPaciente, Long> {

    List<CuidadorPaciente> findByCuidadorId(Long cuidadorId);

    List<CuidadorPaciente> findByPacienteId(Long pacienteId);

    Optional<CuidadorPaciente> findByCuidadorIdAndPacienteId(Long cuidadorId, Long pacienteId);

    boolean existsByCuidadorIdAndPacienteId(Long cuidadorId, Long pacienteId);

    List<CuidadorPaciente> findByCuidadorIdAndEstado(Long cuidadorId, CuidadorPaciente.EstadoVinculacion estado);

    List<CuidadorPaciente> findByPacienteIdAndEstado(Long pacienteId, CuidadorPaciente.EstadoVinculacion estado);
}
