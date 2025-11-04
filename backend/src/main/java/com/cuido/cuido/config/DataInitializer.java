package com.backend_ecommerce_api.backend_ecommerce_api.config;

import com.backend_ecommerce_api.backend_ecommerce_api.model.*;
import com.backend_ecommerce_api.backend_ecommerce_api.repository.CategoriaRepository;
import com.backend_ecommerce_api.backend_ecommerce_api.repository.ProductoRepository;
import com.backend_ecommerce_api.backend_ecommerce_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public void run(String... args) throws Exception {

        String adminEmail = "admin@clicko.com";
        if (!usuarioRepository.existsByEmail(adminEmail)) {
            Usuario admin = new Usuario();
            admin.setNombreCompleto("Administrador");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRol(Rol.ADMIN);
            admin.setDireccion("Dirección Admin");
            admin.setTelefono(0);
            admin.setAvatar("avatar1.png");
            admin.setFechaNacimiento(Date.valueOf("2000-08-10"));
			admin.setSolicitudVendedor(false);
            usuarioRepository.save(admin);
            System.out.println("Usuario ADMIN creado: " + adminEmail + " / Admin123!");
        }

        String nombreCategoria = "Originales ClickCo";
        Categoria categoriaOriginales = categoriaRepository
                .findByNombreIgnoreCase(nombreCategoria)
                .orElseGet(() -> {
                    Categoria nueva = new Categoria();
                    nueva.setNombre(nombreCategoria);
                    return categoriaRepository.save(nueva);
                });

        if (productoRepository.findByCategoriaNombreIgnoreCase(nombreCategoria).isEmpty()) {
            Producto prod1 = new Producto();
            prod1.setNombre("Mouse Gamer ClickCo");
            prod1.setDescripcion("Mouse con luces RGB y 6 botones.");
            prod1.setPrecio(7999.99);
            prod1.setImagen("mouse.png");
            prod1.setStockInicial(10);
            prod1.setStockActual(10);
            prod1.setCategoria(categoriaOriginales);
            usuarioRepository.findByEmail(adminEmail).ifPresent(prod1::setVendedor);

            Producto prod2 = new Producto();
            prod2.setNombre("Teclado Mecánico ClickCo");
            prod2.setDescripcion("Teclado mecánico retroiluminado con switches azules.");
            prod2.setPrecio(14999.00);
            prod2.setImagen("teclado.png");
            prod2.setStockInicial(5);
            prod2.setStockActual(5);
            prod2.setCategoria(categoriaOriginales);
			usuarioRepository.findByEmail(adminEmail).ifPresent(prod2::setVendedor);

            Producto prod3 = new Producto();
            prod3.setNombre("Auriculares ClickCo Pro");
            prod3.setDescripcion("Auriculares inalámbricos con cancelación de ruido.");
            prod3.setPrecio(2999.00);
            prod3.setImagen("auriculares.png");
            prod3.setStockInicial(8);
            prod3.setStockActual(8);
            prod3.setCategoria(categoriaOriginales);
			usuarioRepository.findByEmail(adminEmail).ifPresent(prod3::setVendedor);

            productoRepository.save(prod1);
            productoRepository.save(prod2);
            productoRepository.save(prod3);
            System.out.println("Productos originales creados.");
        }
    }
}
