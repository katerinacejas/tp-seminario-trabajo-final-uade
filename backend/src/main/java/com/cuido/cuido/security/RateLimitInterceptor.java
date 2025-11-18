package com.cuido.cuido.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Interceptor para rate limiting basado en IP
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);

    // Cache de buckets por IP
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // Solo aplicar a métodos anotados con @RateLimited
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RateLimited rateLimited = handlerMethod.getMethodAnnotation(RateLimited.class);

        if (rateLimited == null) {
            return true;
        }

        // Obtener IP del cliente
        String clientIp = getClientIP(request);
        String key = clientIp + ":" + request.getRequestURI();

        // Obtener o crear bucket para esta IP
        Bucket bucket = cache.computeIfAbsent(key, k -> createBucket(rateLimited));

        // Intentar consumir 1 token
        if (bucket.tryConsume(1)) {
            return true;
        }

        // Rate limit excedido
        logger.warn("SECURITY: Rate limit excedido - IP: {}, URI: {}", clientIp, request.getRequestURI());
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Demasiadas solicitudes. Por favor, intenta más tarde.\"}");
        return false;
    }

    /**
     * Crea un bucket con la configuración especificada
     */
    private Bucket createBucket(RateLimited rateLimited) {
        Bandwidth limit = Bandwidth.classic(
            rateLimited.limit(),
            Refill.intervally(rateLimited.limit(), Duration.ofSeconds(rateLimited.periodSeconds()))
        );
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }

    /**
     * Obtiene la IP real del cliente considerando proxies
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
