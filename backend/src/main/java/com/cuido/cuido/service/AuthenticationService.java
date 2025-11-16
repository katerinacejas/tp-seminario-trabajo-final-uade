package com.cuido.cuido.service;

import com.cuido.cuido.exception.EmailYaRegistradoException;
import com.cuido.cuido.exception.InvalidCredentialsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

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
        logger.info("Intento de autenticación para email: {}", request.getEmail());

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

            logger.info("Autenticación exitosa para usuario ID: {}, Rol: {}", usuario.getId(), rol);
            return new JwtResponseDTO(jwt, rol);

        } catch (AuthenticationException ex) {
            logger.warn("Fallo de autenticación para email: {}", request.getEmail());
            throw new InvalidCredentialsException("Credenciales inválidas");
        }
    }

    public JwtResponseDTO register(RegistroRequestDTO request) {
        logger.info("Intento de registro para email: {}, Rol: {}", request.getEmail(), request.getRol());

        try {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                logger.warn("Intento de registro con email ya existente: {}", request.getEmail());
                throw new EmailYaRegistradoException("Ya existe un usuario con ese email");
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
                logger.error("Intento de registro con rol inválido: {}", request.getRol());
                throw new IllegalArgumentException("Rol inválido: " + request.getRol());
            }

            String encryptedPassword = passwordEncoder.encode(request.getPassword());
            nuevoUsuario.setPassword(encryptedPassword);

            usuarioRepository.save(nuevoUsuario);
            logger.info("Usuario registrado exitosamente - ID: {}, Email: {}, Rol: {}",
                       nuevoUsuario.getId(), nuevoUsuario.getEmail(), nuevoUsuario.getRol());

            // Enviar email de bienvenida
            try {
                emailService.enviarEmailBienvenida(
                    nuevoUsuario.getEmail(),
                    nuevoUsuario.getNombreCompleto(),
                    nuevoUsuario.getRol().name().toLowerCase()
                );
                logger.info("Email de bienvenida enviado a: {}", nuevoUsuario.getEmail());
            } catch (Exception e) {
                logger.error("Error al enviar email de bienvenida a {}: {}", nuevoUsuario.getEmail(), e.getMessage());
                // No interrumpimos el registro si falla el email
            }

            String token = jwtUtil.generateToken(nuevoUsuario.getEmail(), nuevoUsuario.getRol().name());
            return new JwtResponseDTO(token, nuevoUsuario.getRol());

        } catch (EmailYaRegistradoException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al registrar usuario: {}", e.getMessage(), e);
            throw new RuntimeException("Error al registrar usuario: " + e.getMessage());
        }
    }
}
