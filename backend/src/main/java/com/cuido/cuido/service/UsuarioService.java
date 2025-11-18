package com.cuido.cuido.service;

import com.cuido.cuido.dto.response.UsuarioResponseDTO;
import com.cuido.cuido.exception.UsuarioNotFoundException;
import com.cuido.cuido.dto.request.UsuarioUpdateRequestDTO;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Autowired
	public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
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

	public UsuarioResponseDTO actualizarUsuario(@NonNull Long id, UsuarioUpdateRequestDTO dto) {
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

	public void cambiarPassword(String email, String currentPassword, String newPassword) {
		Usuario usuario = usuarioRepository.findByEmail(email)
				.orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

		// Verificar que la contraseña actual sea correcta
		if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
			throw new RuntimeException("La contraseña actual es incorrecta");
		}

		// Encriptar y guardar la nueva contraseña
		usuario.setPassword(passwordEncoder.encode(newPassword));
		usuarioRepository.save(usuario);
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
		return dto;
	}

}