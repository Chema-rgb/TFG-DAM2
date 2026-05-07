package com.academia.controller;

import com.academia.dto.PeticionLogin;
import com.academia.dto.RespuestaLogin;
import com.academia.model.Usuario;
import com.academia.repository.UsuarioRepository;
import com.academia.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<RespuestaLogin> iniciarSesion(@RequestBody PeticionLogin request) {
        // si las credenciales no son correctas Spring lanza una excepción sola
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(auth.getName()).orElseThrow();
        String token = jwtUtil.generarToken(usuario.getUsername(), usuario.getRol().name());

        return ResponseEntity.ok(new RespuestaLogin(token, usuario.getUsername(), usuario.getRol().name()));
    }
}
