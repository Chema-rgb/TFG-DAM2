package com.academia.controller;

import com.academia.model.Curso;
import com.academia.model.Matricula;
import com.academia.repository.CursoRepository;
import com.academia.repository.MatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaRepository matriculaRepository;
    @Autowired
    private CursoRepository cursoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Matricula> todasLasMatriculas() {
        return matriculaRepository.findAll();
    }

    @GetMapping("/alumno/{alumnoId}")
    public List<Matricula> porAlumno(@PathVariable Long alumnoId) {
        return matriculaRepository.findByAlumnoId(alumnoId);
    }


    @GetMapping("/curso/{cursoId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Matricula> porCurso(@PathVariable Long cursoId) {
        return matriculaRepository.findByCursoId(cursoId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crear(@RequestBody Matricula matricula) {
        Long alumnoId = matricula.getAlumno().getId();
        Long cursoId = matricula.getCurso().getId();

        if (matriculaRepository.existsByAlumnoIdAndCursoId(alumnoId, cursoId)) {
            return ResponseEntity.badRequest().body("El alumno ya está matriculado en este curso");
        }

        // compruebo si hay plazas libres
        Curso curso = cursoRepository.findById(cursoId).orElse(null);
        if (curso != null && curso.getCapacidad() != null) {
            List<Matricula> lista = matriculaRepository.findByCursoId(cursoId);
            int inscritos = lista.size();
            if (inscritos >= curso.getCapacidad()) {
                // uso 409 para que el frontend lo distinga de otros errores
                return ResponseEntity.status(409).body("CURSO_COMPLETO");
            }
        }

        return ResponseEntity.ok(matriculaRepository.save(matricula));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Matricula> actualizar(@PathVariable Long id, @RequestBody Matricula datos) {
        Matricula m = matriculaRepository.findById(id).orElse(null);
        if (m == null) return ResponseEntity.notFound().build();
        m.setAlumno(datos.getAlumno());
        m.setCurso(datos.getCurso());
        m.setEstado(datos.getEstado());
        return ResponseEntity.ok(matriculaRepository.save(m));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!matriculaRepository.existsById(id)) return ResponseEntity.notFound().build();
        matriculaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
