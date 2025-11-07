package com.cuido.cuido.dto.response;

import com.cuido.cuido.model.Rol;

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
