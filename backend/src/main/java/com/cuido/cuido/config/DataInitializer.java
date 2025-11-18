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
        // No se crean usuarios por defecto
        // Los usuarios se registran desde la app
        System.out.println("DataInitializer ejecutado - Sin usuarios por defecto");
    }
}
