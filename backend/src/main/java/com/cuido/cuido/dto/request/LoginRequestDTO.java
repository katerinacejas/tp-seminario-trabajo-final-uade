package com.backend_ecommerce_api.backend_ecommerce_api.dto.request;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}
