package com.academia.repository;

import com.academia.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByAlumnoId(Long alumnoId);
    // TODO buscar por fechas (para los informes)
    List<Pago> findByEstado(Pago.Estado estado);
    List<Pago> findByAlumnoIdAndEstado(Long alumnoId, Pago.Estado estado);

    void deleteByAlumnoId(Long alumnoId);
    void deleteByCursoId(Long cursoId);
}
