package com.cuido.cuido.service;

import com.cuido.cuido.exception.ExpiredTokenException;
import com.cuido.cuido.exception.UsuarioNotFoundException;
import com.cuido.cuido.model.PasswordResetToken;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.PasswordResetTokenRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordResetTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder
    ) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Genera un código OTP de 6 dígitos y lo envía por email
     * IMPORTANTE: Siempre retorna exitoso para prevenir enumeración de usuarios
     */
    public void solicitarRecuperacion(String email) {
        logger.info("Solicitud de recuperación de contraseña para email: {}", email);

        // Buscar usuario sin lanzar excepción si no existe (prevenir enumeración)
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            // NO lanzar excepción - prevenir enumeración de usuarios
            logger.warn("SECURITY: Intento de recuperación para email no registrado (respuesta genérica enviada): {}", email);
            // Retornar sin hacer nada, el controller ya envía respuesta genérica
            return;
        }

        Usuario usuario = usuarioOpt.get();

        // Invalidar tokens anteriores del mismo usuario
        List<PasswordResetToken> tokensAnteriores = tokenRepository.findByUsuarioAndUsadoFalse(usuario);
        if (!tokensAnteriores.isEmpty()) {
            logger.debug("Invalidando {} tokens anteriores del usuario ID: {}", tokensAnteriores.size(), usuario.getId());
            tokensAnteriores.forEach(token -> token.setUsado(true));
            tokenRepository.saveAll(tokensAnteriores);
        }

        // Generar código OTP de 6 dígitos
        String codigoOtp = generarCodigoOTP();

        // Crear token con expiración de 15 minutos
        PasswordResetToken token = new PasswordResetToken();
        token.setUsuario(usuario);
        token.setCodigoOtp(codigoOtp);
        token.setFechaExpiracion(LocalDateTime.now().plusMinutes(15));
        token.setUsado(false);

        tokenRepository.save(token);
        logger.info("Código OTP generado exitosamente para usuario ID: {}", usuario.getId());

        // Enviar email con el código OTP
        try {
            emailService.enviarCodigoOTP(email, usuario.getNombreCompleto(), codigoOtp);
            logger.info("Email de recuperación enviado exitosamente a: {}", email);
        } catch (Exception e) {
            logger.error("Error al enviar email de recuperación a {}: {}", email, e.getMessage());
            // NO lanzar excepción hacia el controller - mantener respuesta genérica
        }
    }

    /**
     * Valida el código OTP y cambia la contraseña
     */
    public void resetearPassword(String codigoOtp, String nuevaPassword) {
        logger.info("Intento de reseteo de contraseña con código OTP");

        PasswordResetToken token = tokenRepository.findByCodigoOtpAndUsadoFalse(codigoOtp)
                .orElseThrow(() -> {
                    logger.warn("Intento de uso de código OTP inválido o ya utilizado");
                    return new RuntimeException("Código OTP inválido o ya utilizado");
                });

        // Verificar que no haya expirado
        if (token.isExpired()) {
            logger.warn("Intento de uso de código OTP expirado para usuario ID: {}", token.getUsuario().getId());
            throw new ExpiredTokenException("El código OTP ha expirado. Solicita uno nuevo.");
        }

        // Actualizar la contraseña del usuario
        Usuario usuario = token.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
        logger.info("Contraseña actualizada exitosamente para usuario ID: {}", usuario.getId());

        // Marcar el token como usado
        token.setUsado(true);
        tokenRepository.save(token);

        // Enviar email de confirmación de cambio de contraseña
        try {
            emailService.enviarConfirmacionCambioPassword(
                usuario.getEmail(),
                usuario.getNombreCompleto()
            );
            logger.info("Email de confirmación de cambio de contraseña enviado a: {}", usuario.getEmail());
        } catch (Exception e) {
            logger.error("Error al enviar email de confirmación de cambio de contraseña a {}: {}", usuario.getEmail(), e.getMessage());
            // No interrumpimos el proceso si falla el email
        }
    }

    /**
     * Genera un código OTP de 6 dígitos aleatorio
     */
    private String generarCodigoOTP() {
        int otp = 100000 + secureRandom.nextInt(900000); // Genera número entre 100000 y 999999
        return String.valueOf(otp);
    }

    /**
     * Limpia tokens expirados automáticamente cada hora
     * Se ejecuta a los 0 minutos de cada hora
     */
    @Scheduled(cron = "0 0 * * * *")
    public void limpiarTokensExpirados() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            tokenRepository.deleteByFechaExpiracionBefore(ahora);
            logger.info("Limpieza automática ejecutada: Tokens OTP expirados eliminados");
        } catch (Exception e) {
            logger.error("Error en limpieza automática de tokens OTP: {}", e.getMessage(), e);
        }
    }
}
