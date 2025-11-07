package com.cuido.cuido.config;

import com.cuido.cuido.model.*;
import com.cuido.cuido.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.sql.Date;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        String adminEmail = "admin@cuido.com";
        if (!usuarioRepository.existsByEmail(adminEmail)) {
            Usuario admin = new Usuario();
            admin.setNombreCompleto("Administrador");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRol(Rol.ADMIN);
            admin.setDireccion("Dirección Admin");
            admin.setTelefono(0);
            admin.setAvatar("avatar1.png");
            admin.setFechaNacimiento(Date.valueOf("1999-09-03"));
            usuarioRepository.save(admin);
            System.out.println("Usuario ADMIN creado: " + adminEmail + " / contraseña: Admin123!");
        }
	}
}
