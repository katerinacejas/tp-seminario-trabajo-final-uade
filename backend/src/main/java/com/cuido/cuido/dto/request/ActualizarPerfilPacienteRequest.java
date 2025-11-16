package com.cuido.cuido.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ActualizarPerfilPacienteRequest {

    private String nombreCompleto;
    private String email;
    private String password; // Opcional, solo si quiere cambiar contraseña
    private String tipoSanguineo;
    private Double peso;
    private Double altura;
    private String alergias;
    private List<String> condicionesMedicas;
    private List<String> notasImportantes;
    private String obraSocial;
    private String numeroAfiliado;
}
