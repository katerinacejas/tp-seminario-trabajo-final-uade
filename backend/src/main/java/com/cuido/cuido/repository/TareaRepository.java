package com.cuido.cuido.repository;

import com.cuido.cuido.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByPacienteId(Long pacienteId);

    List<Tarea> findByPacienteIdAndCompletada(Long pacienteId, Boolean completada);

    List<Tarea> findByPacienteIdOrderByOrdenManualAsc(Long pacienteId);

    List<Tarea> findByPacienteIdAndCompletadaOrderByOrdenManualAsc(Long pacienteId, Boolean completada);
}
