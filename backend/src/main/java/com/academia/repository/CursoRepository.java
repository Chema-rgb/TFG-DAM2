package com.academia.repository;

import com.academia.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByEstado(Curso.Estado estado);

    // para cuando borro un profesor y tengo que desasignarle los cursos
    List<Curso> findByProfesorId(Long profesorId);
}
