package com.cuido.cuido.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

/**
 * EmailService - Servicio para enviar emails usando SendGrid
 *
 * CONFIGURACIÓN REQUERIDA en application.properties:
 *
 * # SendGrid Configuration
 * sendgrid.api.key=TU_API_KEY_AQUI
 * sendgrid.from.email=noreply@cuidoapp.com
 * sendgrid.from.name=Cuido App
 *
 * CÓMO OBTENER TU API KEY:
 * 1. Ve a https://sendgrid.com/
 * 2. Crea una cuenta (incluye 100 emails/día gratis)
 * 3. Ve a Settings > API Keys > Create API Key
 * 4. Copia la API key y pégala en application.properties
 *
 * IMPORTANTE:
 * - Guarda la API key en application.properties (NO en el código)
 * - Para producción, usa variables de entorno del sistema
 * - SendGrid requiere verificar tu dominio para enviar emails
 */
@Service
public class EmailService {

    @Value("${sendgrid.api.key:}")
    private String apiKey;

    @Value("${sendgrid.from.email:noreply@cuidoapp.com}")
    private String fromEmail;

    @Value("${sendgrid.from.name:Cuido App}")
    private String fromName;

    private static final String SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

    /**
     * Envía un email de invitación a un cuidador
     */
    public void enviarInvitacion(String destinatario, String nombrePaciente, String nombreCuidador) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("⚠️  WARNING: SendGrid API key no configurada. Email NO enviado.");
            System.err.println("   Configura 'sendgrid.api.key' en application.properties");
            return;
        }

        String asunto = "Invitación para ser cuidador en Cuido";
        String cuerpo = String.format(
            "Hola %s,\n\n" +
            "%s te ha invitado a ser su cuidador en Cuido.\n\n" +
            "Cuando inicies sesión en Cuido con este email, podrás ver el perfil del paciente " +
            "y gestionar toda su información médica, recordatorios, bitácoras y documentos.\n\n" +
            "Saludos,\n" +
            "El equipo de Cuido",
            nombreCuidador,
            nombrePaciente
        );

        enviarEmail(destinatario, asunto, cuerpo);
    }

    /**
     * Envía un código OTP para recuperación de contraseña
     */
    public void enviarCodigoOTP(String destinatario, String nombreCompleto, String codigoOtp) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("⚠️  WARNING: SendGrid API key no configurada. Email NO enviado.");
            System.err.println("   Código OTP (solo para desarrollo): " + codigoOtp);
            return;
        }

        String asunto = "Código de recuperación de contraseña - Cuido";
        String cuerpo = String.format(
            "Hola %s,\n\n" +
            "Recibimos una solicitud para recuperar tu contraseña en Cuido.\n\n" +
            "Tu código de verificación es: %s\n\n" +
            "Este código es válido por 15 minutos.\n\n" +
            "Si no solicitaste este código, ignora este mensaje.\n\n" +
            "Saludos,\n" +
            "El equipo de Cuido",
            nombreCompleto,
            codigoOtp
        );

        enviarEmail(destinatario, asunto, cuerpo);
    }

    /**
     * Método privado para enviar emails usando SendGrid API v3
     */
    private void enviarEmail(String destinatario, String asunto, String cuerpo) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Construir el JSON para SendGrid API v3
            Map<String, Object> payload = new HashMap<>();

            // Personalización (from)
            Map<String, String> from = new HashMap<>();
            from.put("email", fromEmail);
            from.put("name", fromName);
            payload.put("from", from);

            // Destinatarios (to)
            Map<String, String> to = new HashMap<>();
            to.put("email", destinatario);
            payload.put("personalizations", new Map[]{
                Map.of("to", new Map[]{to})
            });

            // Asunto
            payload.put("subject", asunto);

            // Contenido
            Map<String, String> content = new HashMap<>();
            content.put("type", "text/plain");
            content.put("value", cuerpo);
            payload.put("content", new Map[]{content});

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(SENDGRID_API_URL, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.ACCEPTED) {
                System.out.println("✅ Email enviado exitosamente a: " + destinatario);
            } else {
                System.err.println("❌ Error al enviar email. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
