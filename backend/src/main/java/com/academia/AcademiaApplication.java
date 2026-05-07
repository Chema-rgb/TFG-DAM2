package com.academia;

import com.academia.model.Usuario;
import com.academia.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AcademiaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AcademiaApplication.class, args);
    }

    @Bean
    CommandLineRunner inicializarDatos(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // creo el admin por defecto si no existe todavía
            if (!usuarioRepository.existsByUsername("admin")) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@academia.com");
                admin.setRol(Usuario.Rol.ADMIN);
                admin.setActivo(true);
                usuarioRepository.save(admin);
                System.out.println("Usuario admin creado: admin / admin123");
            }
        };
    }
}
