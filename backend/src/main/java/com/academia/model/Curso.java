package com.academia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;
    private String nivel;
    private Integer capacidad;
    private Double precio;

    @ManyToOne
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    public Curso() {}

    @PrePersist
    public void prePersist() {
        if (estado == null) estado = Estado.ACTIVO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }


    public Profesor getProfesor() { return profesor; }
    public void setProfesor(Profesor profesor) { this.profesor = profesor; }

    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }

    // para debug
    @Override
    public String toString() {
        return "Curso{id=" + id + ", nombre='" + nombre + "'}";
    }

    public enum Estado {
        ACTIVO, INACTIVO, COMPLETO
    }
}
