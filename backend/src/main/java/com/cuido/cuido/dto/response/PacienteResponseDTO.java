package com.cuido.cuido.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class PacienteResponseDTO {
    private Long id;
    private Long usuarioId;
    private String nombreCompleto;
    private String email;
    private Integer edad;
    private String tipoSanguineo;
    private Double peso;
    private Double altura;
    private String alergias;
    private List<String> condicionesMedicas;
    private List<String> notasImportantes;
    private String obraSocial;
    private String numeroAfiliado;
	private String estadoRelacion;
}
