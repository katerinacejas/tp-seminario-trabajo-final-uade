package com.cuido.cuido.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotación para aplicar rate limiting a endpoints específicos
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {
    /**
     * Número máximo de requests permitidos en el período de tiempo
     */
    int limit() default 10;

    /**
     * Duración del período en segundos
     */
    int periodSeconds() default 60;
}
