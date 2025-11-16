package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.ContactoEmergenciaRequest;
import com.cuido.cuido.dto.response.ContactoEmergenciaResponseDTO;
import com.cuido.cuido.model.ContactoEmergencia;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.ContactoEmergenciaRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ContactoEmergenciaService {

    private final ContactoEmergenciaRepository contactoRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public ContactoEmergenciaService(
            ContactoEmergenciaRepository contactoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.contactoRepository = contactoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public ContactoEmergenciaResponseDTO crear(Long pacienteId, ContactoEmergenciaRequest request) {
        Usuario paciente = usuarioRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        ContactoEmergencia contacto = new ContactoEmergencia();
        contacto.setPaciente(paciente);
        contacto.setNombre(request.getNombre());
        contacto.setTelefono(request.getTelefono());
        contacto.setRelacion(request.getRelacion());
        contacto.setEmail(request.getEmail());
        contacto.setEsContactoPrincipal(request.getEsContactoPrincipal() != null ? request.getEsContactoPrincipal() : false);

        ContactoEmergencia saved = contactoRepository.save(contacto);
        return mapToDTO(saved);
    }

    public ContactoEmergenciaResponseDTO actualizar(Long contactoId, ContactoEmergenciaRequest request) {
        ContactoEmergencia contacto = contactoRepository.findById(contactoId)
                .orElseThrow(() -> new RuntimeException("Contacto no encontrado"));

        contacto.setNombre(request.getNombre());
        contacto.setTelefono(request.getTelefono());
        contacto.setRelacion(request.getRelacion());
        contacto.setEmail(request.getEmail());
        if (request.getEsContactoPrincipal() != null) {
            contacto.setEsContactoPrincipal(request.getEsContactoPrincipal());
        }

        ContactoEmergencia updated = contactoRepository.save(contacto);
        return mapToDTO(updated);
    }

    public void eliminar(Long contactoId) {
        ContactoEmergencia contacto = contactoRepository.findById(contactoId)
                .orElseThrow(() -> new RuntimeException("Contacto no encontrado"));
        contactoRepository.delete(contacto);
    }

    public List<ContactoEmergenciaResponseDTO> getByPaciente(Long pacienteId) {
        List<ContactoEmergencia> contactos = contactoRepository.findByPacienteId(pacienteId);
        return contactos.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private ContactoEmergenciaResponseDTO mapToDTO(ContactoEmergencia contacto) {
        ContactoEmergenciaResponseDTO dto = new ContactoEmergenciaResponseDTO();
        dto.setId(contacto.getId());
        dto.setNombre(contacto.getNombre());
        dto.setTelefono(contacto.getTelefono());
        dto.setRelacion(contacto.getRelacion());
        dto.setEmail(contacto.getEmail());
        dto.setEsContactoPrincipal(contacto.getEsContactoPrincipal());
        return dto;
    }
}
