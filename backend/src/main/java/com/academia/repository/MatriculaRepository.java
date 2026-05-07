package com.academia.repository;

import com.academia.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByAlumnoId(Long alumnoId);
    List<Matricula> findByCursoId(Long cursoId);

    boolean existsByAlumnoIdAndCursoId(Long alumnoId, Long cursoId);

    void deleteByAlumnoId(Long alumnoId);
    void deleteByCursoId(Long cursoId);
}
