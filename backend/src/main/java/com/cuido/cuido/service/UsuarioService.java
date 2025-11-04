package com.backend_ecommerce_api.backend_ecommerce_api.service;

import com.backend_ecommerce_api.backend_ecommerce_api.dto.response.ProductoDTO;
import com.backend_ecommerce_api.backend_ecommerce_api.dto.response.UsuarioResponseDTO;
import com.backend_ecommerce_api.backend_ecommerce_api.exception.ProductoNotFoundException;
import com.backend_ecommerce_api.backend_ecommerce_api.exception.UsuarioNotFoundException;
import com.backend_ecommerce_api.backend_ecommerce_api.dto.request.ProductoUpdateRequestDTO;
import com.backend_ecommerce_api.backend_ecommerce_api.exception.UsuarioNotFoundException;
import com.backend_ecommerce_api.backend_ecommerce_api.dto.request.UsuarioUpdateRequestDTO;
import com.backend_ecommerce_api.backend_ecommerce_api.model.Producto;
import com.backend_ecommerce_api.backend_ecommerce_api.model.Rol;
import com.backend_ecommerce_api.backend_ecommerce_api.model.Usuario;
import com.backend_ecommerce_api.backend_ecommerce_api.repository.ProductoRepository;
import com.backend_ecommerce_api.backend_ecommerce_api.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final ProductoRepository productoRepository;

	@Autowired
	public UsuarioService(UsuarioRepository usuarioRepository, ProductoRepository productoRepository) {
		this.usuarioRepository = usuarioRepository;
		this.productoRepository = productoRepository;
	}

	public List<UsuarioResponseDTO> getTodosLosUsuarios() {
		return usuarioRepository.findAll()
				.stream()
				.map(this::mapToResponseDTO)
				.toList();
	}

	public Optional<UsuarioResponseDTO> getUsuarioPorMail(String email) {
		return usuarioRepository.findByEmail(email)
				.map(this::mapToResponseDTO);
	}

	public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioUpdateRequestDTO dto) {
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado con id: " + id));

		usuario.setNombreCompleto(dto.getNombreCompleto());
		usuario.setDireccion(dto.getDireccion());
		usuario.setTelefono(dto.getTelefono());
		usuario.setFechaNacimiento(dto.getFechaNacimiento());
		usuario.setAvatar(dto.getAvatar());

		return mapToResponseDTO(usuarioRepository.save(usuario));
	}

	public void eliminarUsuario(Long id) {
		if (!usuarioRepository.existsById(id)) {
			throw new UsuarioNotFoundException("Usuario no encontrado con id: " + id);
		}
		usuarioRepository.deleteById(id);
	}

	private UsuarioResponseDTO mapToResponseDTO(Usuario usuario) {
		UsuarioResponseDTO dto = new UsuarioResponseDTO();
		dto.setId(usuario.getId());
		dto.setNombreCompleto(usuario.getNombreCompleto());
		dto.setDireccion(usuario.getDireccion());
		dto.setTelefono(usuario.getTelefono());
		dto.setFechaNacimiento(usuario.getFechaNacimiento());
		dto.setAvatar(usuario.getAvatar());
		dto.setEmail(usuario.getEmail());
		dto.setSolicitudVendedor(usuario.getSolicitudVendedor());
		dto.setProductosComprados(
				usuario.getProductosComprados().stream()
						.map(p -> new ProductoDTO(p.getNombre(), p.getPrecio(), p.getImagen(), p.getDescripcion()))
						.collect(Collectors.toList()));

		dto.setProductosVendidos(
				usuario.getProductosVendidos().stream()
						.map(p -> new ProductoDTO(p.getNombre(), p.getPrecio(), p.getImagen(), p.getDescripcion()))
						.collect(Collectors.toList()));

		return dto;
	}

}