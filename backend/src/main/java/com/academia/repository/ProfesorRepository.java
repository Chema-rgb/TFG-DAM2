package com.academia.repository;

import com.academia.model.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProfesorRepository extends JpaRepository<Profesor, Long> {

    Optional<Profesor> findByUsuarioId(Long usuarioId);
    List<Profesor> findByEstado(Profesor.Estado estado);

    Optional<Profesor> findByDni(String dni);
    Optional<Profesor> findByTelefono(String telefono);
}
