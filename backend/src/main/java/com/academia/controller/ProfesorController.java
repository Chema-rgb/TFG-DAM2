package com.academia.controller;

import com.academia.model.Curso;
import com.academia.model.Profesor;
import com.academia.repository.CursoRepository;
import com.academia.repository.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/profesores")
public class ProfesorController {

    @Autowired
    private ProfesorRepository profesorRepository;
    @Autowired
    private CursoRepository cursoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Profesor> listaProfesores() {
        return profesorRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crear(@RequestBody Profesor profesor) {
        // no puede haber dos profesores con el mismo dni
        String dni = profesor.getDni();
        if (dni != null && !dni.isEmpty() && profesorRepository.findByDni(dni).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un profesor con ese DNI");
        }
        String tel = profesor.getTelefono();
        if (tel != null && !tel.isEmpty() && profesorRepository.findByTelefono(tel).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un profesor con ese teléfono");
        }
        return ResponseEntity.ok(profesorRepository.save(profesor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Profesor datos) {
        Profesor prof = profesorRepository.findById(id).orElse(null);
        if (prof == null) return ResponseEntity.notFound().build();
        String dni = datos.getDni();
        if (dni != null && !dni.isEmpty()) {
            Optional<Profesor> conEseDni = profesorRepository.findByDni(dni);
            if (conEseDni.isPresent() && !conEseDni.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un profesor con ese DNI");
            }
        }
        String tel = datos.getTelefono();
        if (tel != null && !tel.isEmpty()) {
            Optional<Profesor> conEseTel = profesorRepository.findByTelefono(tel);
            if (conEseTel.isPresent() && !conEseTel.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un profesor con ese teléfono");
            }
        }
        prof.setNombre(datos.getNombre());
        prof.setApellidos(datos.getApellidos());
        prof.setDni(datos.getDni());
        prof.setTelefono(datos.getTelefono());
        prof.setEspecialidad(datos.getEspecialidad());
        prof.setEmail(datos.getEmail());
        prof.setEstado(datos.getEstado());
        return ResponseEntity.ok(profesorRepository.save(prof));
    }

    // si borro un profesor los cursos que tenía asignados se quedan sin nadie
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!profesorRepository.existsById(id)) return ResponseEntity.notFound().build();

        try {
            List<Curso> cursos = cursoRepository.findByProfesorId(id);
            for (Curso c : cursos) {
                c.setProfesor(null);
                cursoRepository.save(c);
            }
            profesorRepository.deleteById(id);
        } catch (Exception e) {
            // por si algo falla al desasignar los cursos
            System.out.println("error al borrar profesor: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.noContent().build();
    }
}
