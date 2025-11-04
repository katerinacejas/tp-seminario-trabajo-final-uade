package com.backend_ecommerce_api.backend_ecommerce_api.dto.response;

import lombok.Data;
import java.sql.Date;
import java.util.List;

@Data
public class UsuarioResponseDTO {
    private Long id;
    private String nombreCompleto;
    private String direccion;
    private int telefono;
    private Date fechaNacimiento;
    private String avatar;
    private String email;
	private boolean solicitudVendedor;
	private List<ProductoDTO> productosComprados;
    private List<ProductoDTO> productosVendidos;
}
