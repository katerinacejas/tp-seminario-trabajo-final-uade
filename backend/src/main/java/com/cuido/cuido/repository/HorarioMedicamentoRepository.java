package com.cuido.cuido.repository;

import com.cuido.cuido.model.HorarioMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioMedicamentoRepository extends JpaRepository<HorarioMedicamento, Long> {

    List<HorarioMedicamento> findByMedicamentoIdOrderByHoraAsc(Long medicamentoId);

    void deleteByMedicamentoId(Long medicamentoId);
}
