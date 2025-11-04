package com.backend_ecommerce_api.backend_ecommerce_api.config;

import com.backend_ecommerce_api.backend_ecommerce_api.security.JwtAuthenticationFilter;
import com.backend_ecommerce_api.backend_ecommerce_api.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Aplica configuración CORS
            .csrf(CsrfConfigurer::disable)   // CSRF gestionado selectivamente (stateless API)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
				// TODO EL MUNDO
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/images/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()

				// SOLO COMPRADOR
				.requestMatchers("/api/usuarios/solicitudVendedor").hasRole("COMPRADOR")

                // SOLO COMPRADOR_VENDEDOR O ADMIN
                .requestMatchers(HttpMethod.POST, "/api/productos/**").hasAnyRole("COMPRADOR_VENDEDOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasAnyRole("COMPRADOR_VENDEDOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasAnyRole("COMPRADOR_VENDEDOR", "ADMIN")

				.requestMatchers(HttpMethod.POST, "/api/categorias/**").hasAnyRole("COMPRADOR_VENDEDOR", "ADMIN")


                // SOLO COMPRADOR O COMPRADOR_VENDEDOR
                .requestMatchers("/api/carrito/**").hasAnyRole("COMPRADOR", "COMPRADOR_VENDEDOR")

                .requestMatchers("/api/usuarios/me").hasAnyRole("COMPRADOR", "COMPRADOR_VENDEDOR")


                // SOLO ADMIN
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

				.requestMatchers(HttpMethod.PUT, "/api/categorias/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasRole("ADMIN")


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
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
