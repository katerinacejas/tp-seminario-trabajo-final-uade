package com.cuido.cuido.controller;

import com.cuido.cuido.security.RateLimited;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuido.cuido.dto.request.ForgotPasswordRequestDTO;
import com.cuido.cuido.dto.request.LoginRequestDTO;
import com.cuido.cuido.dto.request.RegistroRequestDTO;
import com.cuido.cuido.dto.request.ResetPasswordRequestDTO;
import com.cuido.cuido.dto.response.JwtResponseDTO;
import com.cuido.cuido.service.AuthenticationService;
import com.cuido.cuido.service.PasswordResetService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    @RateLimited(limit = 100, periodSeconds = 60) // 5 intentos cada 5 minutos
    public JwtResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authenticationService.authenticate(request);
    }

    @PostMapping("/register")
    @RateLimited(limit = 100, periodSeconds = 60) // 3 registros por hora
    public JwtResponseDTO register(@Valid @RequestBody RegistroRequestDTO request) {
        return authenticationService.register(request);
    }

    /**
     * Solicita recuperación de contraseña y envía OTP por email
     */
    @PostMapping("/forgot-password")
    @RateLimited(limit = 100, periodSeconds = 60) // 3 intentos por hora
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        passwordResetService.solicitarRecuperacion(request.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Si el email existe, recibirás un código de verificación.",
            "success", "true"
        ));
    }

    /**
     * Resetea la contraseña usando el código OTP
     */
    @PostMapping("/reset-password")
    @RateLimited(limit = 100, periodSeconds = 60) // 5 intentos cada 5 minutos
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        passwordResetService.resetearPassword(request.getCodigoOtp(), request.getNuevaPassword());
        return ResponseEntity.ok(Map.of(
            "message", "Contraseña actualizada exitosamente.",
            "success", "true"
        ));
    }
}
