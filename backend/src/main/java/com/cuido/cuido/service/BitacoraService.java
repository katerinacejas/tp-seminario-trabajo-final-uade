package com.cuido.cuido.service;

import com.cuido.cuido.dto.request.BitacoraRequestDTO;
import com.cuido.cuido.dto.response.BitacoraResponseDTO;
import com.cuido.cuido.exception.ResourceNotFoundException;
import com.cuido.cuido.model.Bitacora;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.BitacoraRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BitacoraService {

    private final BitacoraRepository bitacoraRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthorizationService authorizationService;

    @Transactional
    public BitacoraResponseDTO crearBitacora(BitacoraRequestDTO request, Long cuidadorId) {
        // VALIDAR ACCESO: Solo cuidadores autorizados pueden crear bitácoras
        authorizationService.validarAccesoAPaciente(request.getPacienteId());

        Usuario paciente = usuarioRepository.findById(request.getPacienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        Usuario cuidador = usuarioRepository.findById(cuidadorId)
            .orElseThrow(() -> new ResourceNotFoundException("Cuidador no encontrado"));

        Bitacora bitacora = new Bitacora();
        bitacora.setPaciente(paciente);
        bitacora.setCuidador(cuidador);
        bitacora.setFecha(request.getFecha());

        // Generar título si no se proporciona
        bitacora.setTitulo(
            request.getTitulo() != null && !request.getTitulo().trim().isEmpty()
                ? request.getTitulo()
                : generarTituloAutomatico(request.getPacienteId(), request.getFecha())
        );

        bitacora.setDescripcion(request.getDescripcion());
        bitacora.setSintomas(request.getSintomas());
        bitacora.setObservaciones(request.getObservaciones());

        Bitacora bitacoraGuardada = bitacoraRepository.save(bitacora);

        return mapToResponseDTO(bitacoraGuardada);
    }

    /**
     * Genera título automático: "Bitácora del DD/MM/YYYY" o con número si ya existe
     */
    private String generarTituloAutomatico(Long pacienteId, LocalDate fecha) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String fechaFormateada = fecha.format(formatter);
        String tituloBase = "Bitácora del " + fechaFormateada;

        // Contar cuántas bitácoras ya existen para ese paciente en esa fecha
        Long count = bitacoraRepository.countByPacienteIdAndFecha(pacienteId, fecha);

        if (count == 0) {
            return tituloBase;
        } else {
            // Si ya existe al menos una, agregar número (2, 3, 4, etc.)
            return tituloBase + " " + (count + 1);
        }
    }

    public List<BitacoraResponseDTO> obtenerBitacorasPorPaciente(Long pacienteId) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(pacienteId);

        List<Bitacora> bitacoras = bitacoraRepository.findByPacienteIdOrderByFechaDescCreatedAtDesc(pacienteId);
        return bitacoras.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public List<BitacoraResponseDTO> obtenerBitacorasPorPacienteYRango(
        Long pacienteId,
        LocalDate fechaInicio,
        LocalDate fechaFin
    ) {
        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(pacienteId);

        List<Bitacora> bitacoras = bitacoraRepository
            .findByPacienteIdAndFechaBetweenOrderByFechaDescCreatedAtDesc(pacienteId, fechaInicio, fechaFin);
        return bitacoras.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public List<BitacoraResponseDTO> obtenerBitacorasPorCuidador(Long cuidadorId) {
        List<Bitacora> bitacoras = bitacoraRepository.findByCuidadorIdOrderByFechaDesc(cuidadorId);
        return bitacoras.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public BitacoraResponseDTO obtenerBitacoraPorId(Long id) {
        Bitacora bitacora = bitacoraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bitácora no encontrada"));

        // VALIDAR ACCESO: Solo el paciente o sus cuidadores autorizados
        authorizationService.validarAccesoAPaciente(bitacora.getPaciente().getId());

        return mapToResponseDTO(bitacora);
    }

    @Transactional
    public BitacoraResponseDTO actualizarBitacora(Long id, BitacoraRequestDTO request, Long cuidadorId) {
        Bitacora bitacora = bitacoraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bitácora no encontrada"));

        // VALIDAR ACCESO: Solo cuidadores autorizados pueden actualizar
        authorizationService.validarAccesoAPaciente(bitacora.getPaciente().getId());

        // Actualizar campos
        bitacora.setFecha(request.getFecha());

        // Si se proporciona título, usarlo; sino, mantener el actual
        if (request.getTitulo() != null && !request.getTitulo().trim().isEmpty()) {
            bitacora.setTitulo(request.getTitulo());
        }

        bitacora.setDescripcion(request.getDescripcion());
        bitacora.setSintomas(request.getSintomas());
        bitacora.setObservaciones(request.getObservaciones());

        Bitacora bitacoraActualizada = bitacoraRepository.save(bitacora);

        return mapToResponseDTO(bitacoraActualizada);
    }

    @Transactional
    public void eliminarBitacora(Long id) {
        Bitacora bitacora = bitacoraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bitácora no encontrada"));

        // VALIDAR ACCESO: Solo cuidadores autorizados pueden eliminar
        authorizationService.validarAccesoAPaciente(bitacora.getPaciente().getId());

        bitacoraRepository.delete(bitacora);
    }

    private BitacoraResponseDTO mapToResponseDTO(Bitacora bitacora) {
        return BitacoraResponseDTO.builder()
            .id(bitacora.getId())
            .pacienteId(bitacora.getPaciente().getId())
            .pacienteNombre(bitacora.getPaciente().getNombreCompleto())
            .cuidadorId(bitacora.getCuidador().getId())
            .cuidadorNombre(bitacora.getCuidador().getNombreCompleto())
            .fecha(bitacora.getFecha())
            .titulo(bitacora.getTitulo())
            .descripcion(bitacora.getDescripcion())
            .sintomas(bitacora.getSintomas())
            .observaciones(bitacora.getObservaciones())
            .createdAt(bitacora.getCreatedAt())
            .updatedAt(bitacora.getUpdatedAt())
            .build();
    }
}
