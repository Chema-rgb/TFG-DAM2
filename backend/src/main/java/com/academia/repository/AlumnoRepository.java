package com.academia.repository;

import com.academia.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {

    // para login de alumnos
    Optional<Alumno> findByUsuarioId(Long usuarioId);

    // lo uso en /me para sacar el alumno desde el username del token
    Optional<Alumno> findByUsuarioUsername(String username);

    List<Alumno> findByEstado(Alumno.Estado estado);

    Optional<Alumno> findByDni(String dni);
    Optional<Alumno> findByTelefono(String telefono);
}
