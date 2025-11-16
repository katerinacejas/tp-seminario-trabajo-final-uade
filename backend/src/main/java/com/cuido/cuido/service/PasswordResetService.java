package com.cuido.cuido.service;

import com.cuido.cuido.model.PasswordResetToken;
import com.cuido.cuido.model.Usuario;
import com.cuido.cuido.repository.PasswordResetTokenRepository;
import com.cuido.cuido.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PasswordResetService {

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
     */
    public void solicitarRecuperacion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe un usuario con ese email"));

        // Invalidar tokens anteriores del mismo usuario
        List<PasswordResetToken> tokensAnteriores = tokenRepository.findByUsuarioAndUsadoFalse(usuario);
        tokensAnteriores.forEach(token -> token.setUsado(true));
        tokenRepository.saveAll(tokensAnteriores);

        // Generar código OTP de 6 dígitos
        String codigoOtp = generarCodigoOTP();

        // Crear token con expiración de 15 minutos
        PasswordResetToken token = new PasswordResetToken();
        token.setUsuario(usuario);
        token.setCodigoOtp(codigoOtp);
        token.setFechaExpiracion(LocalDateTime.now().plusMinutes(15));
        token.setUsado(false);

        tokenRepository.save(token);

        // Enviar email con el código OTP
        emailService.enviarCodigoOTP(email, usuario.getNombreCompleto(), codigoOtp);
    }

    /**
     * Valida el código OTP y cambia la contraseña
     */
    public void resetearPassword(String codigoOtp, String nuevaPassword) {
        PasswordResetToken token = tokenRepository.findByCodigoOtpAndUsadoFalse(codigoOtp)
                .orElseThrow(() -> new RuntimeException("Código OTP inválido o ya utilizado"));

        // Verificar que no haya expirado
        if (token.isExpired()) {
            throw new RuntimeException("El código OTP ha expirado. Solicita uno nuevo.");
        }

        // Actualizar la contraseña del usuario
        Usuario usuario = token.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        // Marcar el token como usado
        token.setUsado(true);
        tokenRepository.save(token);

        // Enviar email de confirmación de cambio de contraseña
        try {
            emailService.enviarConfirmacionCambioPassword(
                usuario.getEmail(),
                usuario.getNombreCompleto()
            );
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar email de confirmación: " + e.getMessage());
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
     * Limpia tokens expirados (puede ejecutarse periódicamente)
     */
    public void limpiarTokensExpirados() {
        tokenRepository.deleteByFechaExpiracionBefore(LocalDateTime.now());
    }
}
