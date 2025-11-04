package com.backend_ecommerce_api.backend_ecommerce_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class EmailYaRegistradoException extends RuntimeException {
    public EmailYaRegistradoException(String message) {
        super(message);
    }
}
