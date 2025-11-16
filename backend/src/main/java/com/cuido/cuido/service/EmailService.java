package com.cuido.cuido.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

/**
 * EmailService - Servicio para enviar emails usando Gmail SMTP
 *
 * CONFIGURACIÓN REQUERIDA en .env:
 *
 * MAIL_HOST=smtp.gmail.com
 * MAIL_PORT=587
 * MAIL_USERNAME=tu_email@gmail.com
 * MAIL_PASSWORD=tu_app_password_aqui
 * MAIL_FROM_NAME=Cuido App
 * MAIL_FROM_ADDRESS=tu_email@gmail.com
 *
 * CÓMO CONFIGURAR GMAIL:
 * 1. Activar verificación en 2 pasos en tu cuenta de Google
 * 2. Ir a: https://myaccount.google.com/apppasswords
 * 3. Crear contraseña de aplicación para "Correo"
 * 4. Copiar la contraseña en MAIL_PASSWORD (sin espacios)
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from.address}")
    private String fromAddress;

    @Value("${mail.from.name}")
    private String fromName;

    /**
     * Envía email de bienvenida al registrar una nueva cuenta
     */
    public void enviarEmailBienvenida(String destinatario, String nombreCompleto, String rol) {
        String asunto = "¡Bienvenido a Cuido App!";
        String cuerpo = construirEmailBienvenida(nombreCompleto, rol);
        enviarEmailHTML(destinatario, asunto, cuerpo);
    }

    /**
     * Envía un código OTP para recuperación de contraseña
     */
    public void enviarCodigoOTP(String destinatario, String nombreCompleto, String codigoOtp) {
        String asunto = "Código de recuperación de contraseña - Cuido";
        String cuerpo = construirEmailOTP(nombreCompleto, codigoOtp);
        enviarEmailHTML(destinatario, asunto, cuerpo);
    }

    /**
     * Envía confirmación de cambio de contraseña
     */
    public void enviarConfirmacionCambioPassword(String destinatario, String nombreCompleto) {
        String asunto = "Contraseña actualizada - Cuido";
        String cuerpo = construirEmailConfirmacionPassword(nombreCompleto);
        enviarEmailHTML(destinatario, asunto, cuerpo);
    }

    /**
     * Envía un email de invitación a un cuidador
     */
    public void enviarInvitacion(String destinatario, String nombrePaciente, String nombreCuidador) {
        String asunto = "Invitación para ser cuidador en Cuido";
        String cuerpo = construirEmailInvitacion(nombrePaciente, nombreCuidador);
        enviarEmailHTML(destinatario, asunto, cuerpo);
    }

    /**
     * Método privado para enviar emails HTML usando JavaMailSender
     */
    private void enviarEmailHTML(String destinatario, String asunto, String cuerpoHTML) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHTML, true); // true = HTML

            mailSender.send(mensaje);
            System.out.println("✅ Email enviado exitosamente a: " + destinatario);

        } catch (MessagingException e) {
            System.err.println("❌ Error al enviar email a " + destinatario + ": " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Error inesperado al enviar email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // =============================================
    // PLANTILLAS DE EMAILS
    // =============================================

    private String construirEmailBienvenida(String nombreCompleto, String rol) {
        String rolTexto = rol.equals("paciente") ? "paciente" : "cuidador";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido a Cuido App!</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>%s</strong>,</p>

                        <p>¡Nos alegra mucho que te hayas unido a Cuido App! Tu cuenta como <strong>%s</strong> ha sido creada exitosamente.</p>

                        <p><strong>¿Qué es Cuido App?</strong><br>
                        Cuido es tu asistente personal para el cuidado de la salud. Te ayudamos a:</p>

                        <ul>
                            <li>📋 Gestionar información médica y documentos</li>
                            <li>💊 Recordar medicamentos y citas médicas</li>
                            <li>📝 Llevar un registro diario de síntomas</li>
                            <li>👥 Coordinar el cuidado con familiares</li>
                        </ul>

                        <p>Ya puedes iniciar sesión y comenzar a usar todas nuestras funcionalidades.</p>

                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

                        <p>¡Gracias por confiar en nosotros!</p>

                        <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Cuido</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCompleto, rolTexto);
    }

    private String construirEmailOTP(String nombreCompleto, String codigoOtp) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0; border-radius: 10px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Recuperación de Contraseña</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>%s</strong>,</p>

                        <p>Recibimos una solicitud para recuperar tu contraseña en Cuido App.</p>

                        <p><strong>Tu código de verificación es:</strong></p>

                        <div class="otp-code">%s</div>

                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul style="margin: 10px 0 0 0;">
                                <li>Este código es válido por <strong>15 minutos</strong></li>
                                <li>No compartas este código con nadie</li>
                                <li>Si no solicitaste este código, ignora este mensaje</li>
                            </ul>
                        </div>

                        <p>Ingresa este código en la aplicación para continuar con el proceso de recuperación.</p>

                        <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Cuido</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCompleto, codigoOtp);
    }

    private String construirEmailConfirmacionPassword(String nombreCompleto) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; color: #155724; }
                    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Contraseña Actualizada</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>%s</strong>,</p>

                        <div class="success">
                            <strong>✅ Tu contraseña ha sido actualizada exitosamente</strong>
                        </div>

                        <p>Este es un mensaje de confirmación para informarte que tu contraseña de Cuido App ha sido cambiada correctamente.</p>

                        <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>

                        <p><strong>⚠️ Si no realizaste este cambio:</strong><br>
                        Por favor contacta a nuestro equipo de soporte inmediatamente para proteger tu cuenta.</p>

                        <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Cuido</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCompleto);
    }

    private String construirEmailInvitacion(String nombrePaciente, String nombreCuidador) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .invitation-box { background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
                    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>👥 Invitación para ser Cuidador</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>%s</strong>,</p>

                        <div class="invitation-box">
                            <h2 style="color: #667eea; margin: 0;">🎯 Has sido invitado</h2>
                            <p style="font-size: 18px;"><strong>%s</strong> te ha invitado a ser su cuidador en Cuido App</p>
                        </div>

                        <p><strong>¿Qué significa ser cuidador?</strong></p>

                        <p>Como cuidador, podrás:</p>
                        <ul>
                            <li>📋 Ver y actualizar la información médica del paciente</li>
                            <li>💊 Gestionar recordatorios de medicamentos y citas</li>
                            <li>📝 Llevar registro de síntomas en la bitácora diaria</li>
                            <li>📄 Acceder a documentos médicos importantes</li>
                            <li>✅ Administrar tareas de cuidado</li>
                        </ul>

                        <p><strong>¿Qué hacer ahora?</strong></p>
                        <p>Si ya tienes una cuenta en Cuido App con este email, simplemente inicia sesión y verás a <strong>%s</strong> en tu lista de pacientes.</p>

                        <p>Si aún no tienes cuenta, descarga la aplicación y regístrate con este mismo email para aceptar la invitación.</p>

                        <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Cuido</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCuidador, nombrePaciente, nombrePaciente);
    }
}
