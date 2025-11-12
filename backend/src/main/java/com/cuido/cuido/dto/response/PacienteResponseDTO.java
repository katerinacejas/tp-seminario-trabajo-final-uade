package com.cuido.cuido.dto.response;

import lombok.Data;

@Data
public class PacienteResponseDTO {
    private Long id;
    private Long usuarioId;
    private String nombreCompleto;
    private Integer edad;
    private String tipoSanguineo;
    private Double peso;
    private Double altura;
    private String alergias;
    private String condicionesMedicas;
    private String observaciones;
    private String obraSocial;
    private String numeroAfiliado;
}
