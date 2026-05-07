package com.academia;

import com.academia.model.Alumno;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AlumnoTest {

    @Test
    public void testDatosBasicos() {
        Alumno a = new Alumno();
        a.setNombre("Juan");
        a.setApellidos("García");
        a.setDni("12345678A");

        assertEquals("Juan", a.getNombre());
        assertEquals("García", a.getApellidos());
        assertEquals("12345678A", a.getDni());
    }

    @Test
    public void testEstado() {
        Alumno a = new Alumno();
        a.setEstado(Alumno.Estado.ACTIVO);
        assertEquals(Alumno.Estado.ACTIVO, a.getEstado());
    }

    @Test
    public void testCamposNulos() {
        Alumno a = new Alumno();
        assertNull(a.getDni());
        assertNull(a.getTelefono());
    }
}
