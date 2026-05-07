# TFG - Sistema de gestión de academia

Aplicación web para gestionar una academia de formación. Permite administrar alumnos, profesores, cursos, matrículas y pagos.

TFG del ciclo DAM - 2º curso.

## Tecnologías

**Backend:** Java 21, Spring Boot 3.4.3, Spring Security + JWT, JPA con PostgreSQL

**Frontend:** HTML, CSS y JavaScript sin frameworks

## Cómo ejecutar

Primero el backend:
```
cd backend
mvn spring-boot:run
```

Luego el frontend (en otra terminal):
```
cd frontend
python3 -m http.server 3000
```

Y abrir http://localhost:3000 en el navegador.

La API REST corre en el puerto 8082. La documentación de los endpoints está en http://localhost:8082/swagger-ui.html

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | ADMIN |
| profesor1 | prof123 | PROFESOR |
| alumno1 | alum123 | ALUMNO |

## Tests

```
cd backend
mvn test
```

## Base de datos

PostgreSQL en Neon (cloud). El esquema lo genera Hibernate automáticamente al arrancar.
