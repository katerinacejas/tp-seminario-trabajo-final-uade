package com.cuido.cuido.config;

import com.cuido.cuido.security.JwtAuthenticationFilter;
import com.cuido.cuido.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:19006,http://localhost:8081}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(CsrfConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
				// =============================================
				// RUTAS PÚBLICAS (sin autenticación)
				// =============================================
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/imagenes/**").permitAll()

				// =============================================
				// RUTAS PARA CUIDADORES
				// =============================================
				// Bitácoras - solo cuidadores pueden crear/editar
				.requestMatchers(HttpMethod.POST, "/api/bitacoras/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.PUT, "/api/bitacoras/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.DELETE, "/api/bitacoras/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.GET, "/api/bitacoras/**").hasAnyRole("CUIDADOR", "PACIENTE")

				// Tareas - solo cuidadores pueden gestionar
				.requestMatchers("/api/tareas/**").hasRole("CUIDADOR")

				// Recordatorios y medicamentos - solo cuidadores
				.requestMatchers(HttpMethod.POST, "/api/recordatorios/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.PATCH, "/api/recordatorios/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.DELETE, "/api/recordatorios/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.GET, "/api/recordatorios/**").hasAnyRole("CUIDADOR", "PACIENTE")

				// Documentos - solo cuidadores pueden subir/eliminar
				.requestMatchers(HttpMethod.POST, "/api/documentos/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.DELETE, "/api/documentos/**").hasRole("CUIDADOR")
				.requestMatchers(HttpMethod.GET, "/api/documentos/**").hasAnyRole("CUIDADOR", "PACIENTE")

				// =============================================
				// RUTAS PARA PACIENTES
				// =============================================
				// Contactos de emergencia - solo pacientes pueden gestionar
				.requestMatchers("/api/contactos-emergencia/**").hasRole("PACIENTE")

				// Gestión de cuidadores - solo pacientes pueden invitar/desvincular
				.requestMatchers(HttpMethod.POST, "/api/cuidadores-pacientes/invitar").hasRole("PACIENTE")
				.requestMatchers(HttpMethod.DELETE, "/api/cuidadores-pacientes/**").hasRole("PACIENTE")
				.requestMatchers(HttpMethod.GET, "/api/cuidadores-pacientes/**").hasAnyRole("PACIENTE", "CUIDADOR")

				// Aceptar invitación - solo cuidadores
				.requestMatchers(HttpMethod.POST, "/api/cuidadores-pacientes/{relacionId}/aceptar").hasRole("CUIDADOR")

				// Perfil paciente - solo pacientes pueden actualizar su propio perfil
				.requestMatchers(HttpMethod.PUT, "/api/pacientes/perfil/**").hasRole("PACIENTE")
				.requestMatchers(HttpMethod.GET, "/api/pacientes/**").hasAnyRole("CUIDADOR", "PACIENTE")

				// =============================================
				// RUTAS COMPARTIDAS (CUIDADOR Y PACIENTE)
				// =============================================
				// Perfil de usuario
				.requestMatchers("/api/usuarios/me").hasAnyRole("CUIDADOR", "PACIENTE")
				.requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasAnyRole("CUIDADOR", "PACIENTE")
				.requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAnyRole("CUIDADOR", "PACIENTE")

				// Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            )

            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Configurar orígenes permitidos desde variable de entorno o .env
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);

        // Métodos HTTP permitidos
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Headers permitidos (restrictivo en producción)
        config.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
        ));

        // Headers expuestos al cliente
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition"
        ));

        // Permitir credenciales (cookies, authorization headers)
        config.setAllowCredentials(true);

        // Cache de preflight requests (1 hora)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
