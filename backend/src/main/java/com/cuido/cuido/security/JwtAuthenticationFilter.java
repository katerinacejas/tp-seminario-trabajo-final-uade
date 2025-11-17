package com.cuido.cuido.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
        throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        String jwt = null;
        String email = null;
		String rolNombre = null;

        // NO loguear el header completo ni el token - contiene credenciales sensibles
        logger.debug("Procesando request con autenticación JWT");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);

            try {
                email = jwtUtil.extractUsername(jwt);
				rolNombre = jwtUtil.extractRole(jwt);

                logger.debug("Token JWT procesado para usuario: {}", email);
            } catch (Exception e) {
                logger.warn("Error al procesar token JWT: {}", e.getMessage());
            }
        }

        if (email != null && rolNombre != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            boolean tokenValido = jwtUtil.isTokenValid(jwt, email);

            if (tokenValido) {
				UserDetails userDetails = userDetailsService.loadUserByUsername(email);
				logger.debug("Autenticación exitosa para usuario: {}", email);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                logger.warn("Token JWT inválido para usuario: {}", email);
            }
        }

        filterChain.doFilter(request, response);
    }
}
