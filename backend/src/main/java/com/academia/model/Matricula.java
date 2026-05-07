package com.academia.model;

import jakarta.persistence.*;
import java.time.LocalDate;

// la restricción unique evita que un alumno se matricule dos veces en el mismo curso
@Entity
@Table(name = "matriculas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"alumno_id", "curso_id"})
})
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @ManyToOne
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "fecha_matricula")
    private LocalDate fechaMatricula;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    public Matricula() {}

    @PrePersist
    public void prePersist() {
        fechaMatricula = LocalDate.now();
        if (estado == null) estado = Estado.ACTIVA;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Alumno getAlumno() { return alumno; }
    public void setAlumno(Alumno alumno) { this.alumno = alumno; }


    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }

    public LocalDate getFechaMatricula() { return fechaMatricula; }
    public void setFechaMatricula(LocalDate fechaMatricula) { this.fechaMatricula = fechaMatricula; }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) { this.estado = estado; }

    public enum Estado {
        ACTIVA, CANCELADA, COMPLETADA
    }
}
