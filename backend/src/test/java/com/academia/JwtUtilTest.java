package com.academia;

import com.academia.security.JwtUtil;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    public void testGenerarToken() {
        String token = jwtUtil.generarToken("admin", "ADMIN");
        assertNotNull(token);
    }

    @Test
    public void testUsernameEnToken() {
        String token = jwtUtil.generarToken("jose", "PROFESOR");
        assertEquals("jose", jwtUtil.obtenerUsername(token));
    }

    @Test
    public void testRolEnToken() {
        String token = jwtUtil.generarToken("admin", "ADMIN");
        assertEquals("ADMIN", jwtUtil.obtenerRol(token));
    }

    @Test
    public void testTokenValidoEInvalido() {
        String token = jwtUtil.generarToken("usuario1", "ALUMNO");
        assertTrue(jwtUtil.esValido(token));
        assertFalse(jwtUtil.esValido("tokenfalso123"));
    }
}
