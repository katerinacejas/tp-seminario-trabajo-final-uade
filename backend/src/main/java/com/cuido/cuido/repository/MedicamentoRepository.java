package com.cuido.cuido.repository;

import com.cuido.cuido.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    List<Medicamento> findByPacienteIdAndActivoTrueOrderByNombreAsc(Long pacienteId);

    List<Medicamento> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId);

    List<Medicamento> findByCuidadorIdOrderByCreatedAtDesc(Long cuidadorId);
}
