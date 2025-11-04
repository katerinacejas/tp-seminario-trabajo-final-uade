package com.backend_ecommerce_api.backend_ecommerce_api.dto.response;

import com.backend_ecommerce_api.backend_ecommerce_api.model.Rol;

import lombok.Data;

@Data
public class JwtResponseDTO {
    private String token;
	private Rol rol;

	public JwtResponseDTO(String token, Rol rol) {
        this.token = token;
        this.rol   = rol;
    }
}
