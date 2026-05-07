package com.academia.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // si la clave es muy corta la librería falla, así que la pongo larga
    private static final String SECRET = "tfg_academia_jose_manuel_2024_clave_jwt_superSecreta_nodivulgar";
    private static final long EXPIRACION = 24 * 60 * 60 * 1000; // 24 horas en ms

    private SecretKey obtenerClave() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(String username, String rol) {
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRACION))
                .signWith(obtenerClave())
                .compact();
    }

    public String obtenerUsername(String token) {
        return leerClaims(token).getSubject();
    }

    public String obtenerRol(String token) {
        return leerClaims(token).get("rol", String.class);
    }

    // devuelve false si el token ha expirado o la firma no cuadra
    public boolean esValido(String token) {
        try {
            leerClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims leerClaims(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
