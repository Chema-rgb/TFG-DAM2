// muestra los datos del alumno logueado
verificarRol('ALUMNO');

async function cargarPerfil() {
    var cont = document.getElementById('datosPerfil');
    try {
        var p = await llamarApi('/alumnos/me');
        if (!p) {
            cont.innerHTML = '<p>No se han podido cargar tus datos.</p>';
            return;
        }
        var html = '';
        html += '<div class="form-grid">';
        html += fila('Nombre', p.nombre);
        html += fila('Apellidos', p.apellidos);
        html += fila('DNI', p.dni);
        html += fila('Email', p.email);
        html += fila('Teléfono', p.telefono);
        html += fila('Dirección', p.direccion);
        html += fila('Fecha nacimiento', p.fechaNacimiento);
        html += fila('Fecha inscripción', p.fechaInscripcion);
        html += fila('Estado', p.estado);
        html += '</div>';
        html += '<p style="margin-top:1rem;color:#888;font-size:0.9rem">Si algún dato no es correcto avisa a la administración.</p>';
        cont.innerHTML = html;
    } catch (e) {
        cont.innerHTML = '<p style="color:red">Error: ' + e.message + '</p>';
    }
}

function fila(etiqueta, valor) {
    var v = (valor === null || valor === undefined || valor === '') ? '-' : valor;
    return '<div class="form-group"><label>' + etiqueta + '</label><div>' + v + '</div></div>';
}

cargarPerfil();
