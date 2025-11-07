package com.cuido.cuido.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Logger;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    private static final Logger logger = Logger.getLogger(JwtAuthenticationFilter.class.getName());

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
        throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        String jwt = null;
        String email = null;
		String rolNombre = null;

        logger.info("Authorization Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            logger.info("Token recibido: " + jwt);

            try {
                email = jwtUtil.extractUsername(jwt);
				rolNombre = jwtUtil.extractRole(jwt);

                logger.info("Email extraído del token: " + email);
				logger.info("rol extraído del token: " + rolNombre);
            } catch (Exception e) {
                logger.warning("Error al extraer el email o el rol del token: " + e.getMessage());
            }
        }

        if (email != null && rolNombre != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            boolean tokenValido = jwtUtil.isTokenValid(jwt, email);
            logger.info("¿Token válido? " + tokenValido);

            if (tokenValido) {
				UserDetails userDetails = userDetailsService.loadUserByUsername(email);
				logger.info("UserDetails cargado: " + userDetails.getUsername());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("Autenticación seteada en el contexto de seguridad.");
                logger.info("Authorities asignadas: " + authToken.getAuthorities());
            } else {
                logger.warning("Token inválido, no se setea autenticación.");
            }
        }

        filterChain.doFilter(request, response);
    }
}
