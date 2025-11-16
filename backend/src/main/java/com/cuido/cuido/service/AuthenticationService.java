package com.cuido.cuido.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cuido.cuido.dto.request.LoginRequestDTO;
import com.cuido.cuido.dto.request.RegistroRequestDTO;
import com.cuido.cuido.dto.response.JwtResponseDTO;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.model.Rol;
import com.cuido.cuido.repository.UsuarioRepository;
import com.cuido.cuido.security.JwtUtil;

@Service
public class AuthenticationService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public JwtResponseDTO authenticate(LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            Usuario usuario = (Usuario) authentication.getPrincipal();
			
			String rolString = usuario.getRol().name();
            String jwt = jwtUtil.generateToken(usuario.getEmail(), rolString);
			Rol rol = usuario.getRol();

            return new JwtResponseDTO(jwt, rol);

        } catch (AuthenticationException ex) {
            throw new RuntimeException("Credenciales inválidas");
        }
    }

    public JwtResponseDTO register(RegistroRequestDTO request) {
        try {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Ya existe un usuario con ese email");
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombreCompleto(request.getNombreCompleto());
            nuevoUsuario.setDireccion(request.getDireccion());
            nuevoUsuario.setTelefono(request.getTelefono());
            nuevoUsuario.setFechaNacimiento(request.getFechaNacimiento());
            nuevoUsuario.setAvatar(request.getAvatar());
            nuevoUsuario.setEmail(request.getEmail());
			if ("CUIDADOR".equals(request.getRol())) {
				nuevoUsuario.setRol(Rol.CUIDADOR);
			} else if ("PACIENTE".equals(request.getRol())) {
				nuevoUsuario.setRol(Rol.PACIENTE);
			} else {
				throw new RuntimeException("Rol inválido: " + request.getRol());
			}

            String encryptedPassword = passwordEncoder.encode(request.getPassword());
            nuevoUsuario.setPassword(encryptedPassword);

            usuarioRepository.save(nuevoUsuario);

            // Enviar email de bienvenida
            try {
                emailService.enviarEmailBienvenida(
                    nuevoUsuario.getEmail(),
                    nuevoUsuario.getNombreCompleto(),
                    nuevoUsuario.getRol().name().toLowerCase()
                );
            } catch (Exception e) {
                System.err.println("⚠️ Error al enviar email de bienvenida: " + e.getMessage());
                // No interrumpimos el registro si falla el email
            }

            String token = jwtUtil.generateToken(nuevoUsuario.getEmail(), nuevoUsuario.getRol().name());
            return new JwtResponseDTO(token, nuevoUsuario.getRol());

        } catch (Exception e) {
            throw new RuntimeException("Error al registrar usuario: " + e.getMessage());
        }
    }
} 
