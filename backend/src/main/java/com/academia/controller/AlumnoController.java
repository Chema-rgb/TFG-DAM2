package com.academia.controller;

import com.academia.model.Alumno;
import com.academia.model.Usuario;
import com.academia.repository.AlumnoRepository;
import com.academia.repository.MatriculaRepository;
import com.academia.repository.PagoRepository;
import com.academia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;
    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private MatriculaRepository matriculaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Alumno> listar() {
        return alumnoRepository.findAll();
    }

    // el alumno usa esto desde su panel para ver sus propios datos
    @GetMapping("/me")
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<Alumno> miPerfil(Authentication auth) {
        Alumno a = alumnoRepository.findByUsuarioUsername(auth.getName()).orElse(null);
        if (a == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(a);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR','ALUMNO')")
    public ResponseEntity<Alumno> obtener(@PathVariable Long id) {
        Alumno alumno = alumnoRepository.findById(id).orElse(null);
        if (alumno == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(alumno);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> crear(@RequestBody Alumno alumno) {
        // compruebo que el dni no esté ya usado
        if (alumno.getDni() == null || alumno.getDni().isEmpty()) {
            return ResponseEntity.badRequest().body("El DNI es obligatorio");
        }
        if (alumno.getEmail() == null || alumno.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("El email es obligatorio");
        }
        if (alumnoRepository.findByDni(alumno.getDni()).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un alumno con ese DNI");
        }
        if (alumno.getTelefono() != null && !alumno.getTelefono().isEmpty()) {
            if (alumnoRepository.findByTelefono(alumno.getTelefono()).isPresent()) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese teléfono");
            }
        }
        // tampoco puede haber otro usuario con el mismo username (dni) o email
        if (usuarioRepository.existsByUsername(alumno.getDni())) {
            return ResponseEntity.badRequest().body("Ya existe un usuario con ese DNI");
        }
        if (usuarioRepository.existsByEmail(alumno.getEmail())) {
            return ResponseEntity.badRequest().body("Ya existe un usuario con ese email");
        }

        // creo el usuario para que el alumno pueda entrar al panel
        // de momento la contraseña inicial es el dni, luego él se la cambia
        Usuario u = new Usuario();
        u.setUsername(alumno.getDni());
        u.setPassword(passwordEncoder.encode(alumno.getDni()));
        u.setEmail(alumno.getEmail());
        u.setRol(Usuario.Rol.ALUMNO);
        u.setActivo(true);
        usuarioRepository.save(u);

        alumno.setUsuario(u);
        return ResponseEntity.ok(alumnoRepository.save(alumno));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Alumno datos) {
        Alumno alumno = alumnoRepository.findById(id).orElse(null);
        if (alumno == null) return ResponseEntity.notFound().build();

        // si cambia el dni compruebo que no lo tenga ya otro alumno
        if (datos.getDni() != null && !datos.getDni().isEmpty()) {
            Optional<Alumno> existente = alumnoRepository.findByDni(datos.getDni());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese DNI");
            }
        }
        if (datos.getTelefono() != null && !datos.getTelefono().isEmpty()) {
            Optional<Alumno> existente = alumnoRepository.findByTelefono(datos.getTelefono());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese teléfono");
            }
        }

        // por si acaso compruebo que el nombre no venga vacío
        if (datos.getNombre() != null && !datos.getNombre().isEmpty()) {
            alumno.setNombre(datos.getNombre());
        }
        alumno.setApellidos(datos.getApellidos());
        alumno.setDni(datos.getDni());
        alumno.setTelefono(datos.getTelefono());
        alumno.setDireccion(datos.getDireccion());
        alumno.setEmail(datos.getEmail());
        alumno.setFechaNacimiento(datos.getFechaNacimiento());
        alumno.setEstado(datos.getEstado());

        System.out.println("alumno actualizado: " + id);
        return ResponseEntity.ok(alumnoRepository.save(alumno));
    }

    // tuve que añadir el @Transactional porque sin él petaba al borrar si tenía matrículas
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Alumno a = alumnoRepository.findById(id).orElse(null);
        if (a == null) return ResponseEntity.notFound().build();
        pagoRepository.deleteByAlumnoId(id);
        matriculaRepository.deleteByAlumnoId(id);
        Usuario u = a.getUsuario();
        alumnoRepository.deleteById(id);
        // borro también el usuario asociado para no dejar cuentas huérfanas
        if (u != null) usuarioRepository.deleteById(u.getId());
        return ResponseEntity.noContent().build();
    }
}
