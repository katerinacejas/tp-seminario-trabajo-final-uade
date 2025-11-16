package com.cuido.cuido.repository;

import com.cuido.cuido.model.ContactoEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactoEmergenciaRepository extends JpaRepository<ContactoEmergencia, Long> {

    // Encuentra todos los contactos de emergencia de un paciente
    List<ContactoEmergencia> findByPacienteId(Long pacienteId);
}
