const user = obtenerUsuario();
const isAdmin = user?.rol === 'ADMIN';

if (!isAdmin) document.getElementById('btnNuevoAlumno').style.display = 'none';

var todosAlumnos = [];

// filtro en local para no hacer una petición al backend cada vez que escribe algo
function buscar(texto) {
    if (!texto) {
        mostrarAlumnos(todosAlumnos);
        return;
    }
    var filtrados = [];
    for (var i = 0; i < todosAlumnos.length; i++) {
        var nombre = todosAlumnos[i].nombre + ' ' + todosAlumnos[i].apellidos;
        if (nombre.toLowerCase().includes(texto.toLowerCase())) {
            filtrados.push(todosAlumnos[i]);
        }
    }
    mostrarAlumnos(filtrados);
}

function mostrarAlumnos(alumnos) {
    const tbody = document.getElementById('tbodyAlumnos');
    if (!alumnos || alumnos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No hay alumnos registrados</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < alumnos.length; i++) {
        var a = alumnos[i];
        // el profesor solo puede ver, no editar ni borrar
        // el profesor solo puede ver, no editar ni borrar
        var acciones = '';
        if (isAdmin) {
            acciones += '<button class="btn btn-sm btn-icon" onclick="editarAlumno(' + a.id + ')">Editar</button>';
            acciones += '<button class="btn btn-sm btn-icon btn-danger" onclick="eliminarAlumno(' + a.id + ')">Borrar</button>';
        } else {
            acciones = '<button class="btn btn-sm btn-icon" onclick="verAlumno(' + a.id + ')">Ver</button>';
        }
        html += '<tr>';
        html += '<td>' + a.id + '</td>';
        html += '<td>' + a.nombre + '</td>';
        html += '<td>' + a.apellidos + '</td>';
        html += '<td>' + (a.dni || '-') + '</td>';
        html += '<td>' + (a.telefono || '-') + '</td>';
        html += '<td><span class="badge badge-' + (a.estado ? a.estado.toLowerCase() : '') + '">' + a.estado + '</span></td>';
        html += '<td class="actions-cell">' + acciones + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function cargarAlumnos() {
    var alumnos = await llamarApi('/alumnos');
    todosAlumnos = alumnos || [];
    mostrarAlumnos(todosAlumnos);
}

document.querySelector('#modalAlumno .modal-close').addEventListener('click', () => {
    document.querySelectorAll('#formAlumno input, #formAlumno select').forEach(el => el.removeAttribute('disabled'));
    document.querySelector('#formAlumno button[type="submit"]').style.display = '';
});

document.getElementById('btnNuevoAlumno')?.addEventListener('click', () => {
    document.getElementById('formAlumno').reset();
    document.getElementById('alumnoId').value = '';
    document.getElementById('modalAlumnoTitle').textContent = 'Nuevo Alumno';
    abrirModal('modalAlumno');
});

async function verAlumno(id) {
    const a = await llamarApi('/alumnos/' + id);
    document.getElementById('alumnoId').value = a.id;
    document.getElementById('alumnoNombre').value = a.nombre;
    document.getElementById('alumnoApellidos').value = a.apellidos;
    document.getElementById('alumnoDni').value = a.dni || '';
    document.getElementById('alumnoTelefono').value = a.telefono || '';
    document.getElementById('alumnoDireccion').value = a.direccion || '';
    document.getElementById('alumnoFechaNacimiento').value = a.fechaNacimiento || '';
    document.getElementById('alumnoEmail').value = a.email || '';
    document.getElementById('alumnoEstado').value = a.estado;
    document.getElementById('modalAlumnoTitle').textContent = 'Ver Alumno';
    document.querySelectorAll('#formAlumno input, #formAlumno select').forEach(el => el.setAttribute('disabled', true));
    document.querySelector('#formAlumno button[type="submit"]').style.display = 'none';
    abrirModal('modalAlumno');
}

async function editarAlumno(id) {
    const a = await llamarApi('/alumnos/' + id);
    document.getElementById('alumnoId').value = a.id;
    document.getElementById('alumnoNombre').value = a.nombre;
    document.getElementById('alumnoApellidos').value = a.apellidos;
    document.getElementById('alumnoDni').value = a.dni || '';
    document.getElementById('alumnoTelefono').value = a.telefono || '';
    document.getElementById('alumnoDireccion').value = a.direccion || '';
    document.getElementById('alumnoFechaNacimiento').value = a.fechaNacimiento || '';
    document.getElementById('alumnoEmail').value = a.email || '';
    document.getElementById('alumnoEstado').value = a.estado;
    document.getElementById('modalAlumnoTitle').textContent = 'Editar Alumno';
    abrirModal('modalAlumno');
}

async function eliminarAlumno(id) {
    if (!await confirmarAccion('¿Eliminar este alumno?', 'Eliminar alumno')) return;
    await llamarApi('/alumnos/' + id, { method: 'DELETE' });
    mostrarExito('Alumno eliminado');
    cargarAlumnos();
}

document.getElementById('formAlumno').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('alumnoId').value;

    if (!document.getElementById('alumnoNombre').value.trim()) {
        alert('El nombre es obligatorio');
        return;
    }
    if (!document.getElementById('alumnoApellidos').value.trim()) {
        alert('Los apellidos son obligatorios');
        return;
    }

    const body = {
        nombre: document.getElementById('alumnoNombre').value,
        apellidos: document.getElementById('alumnoApellidos').value,
        dni: document.getElementById('alumnoDni').value,
        telefono: document.getElementById('alumnoTelefono').value,
        direccion: document.getElementById('alumnoDireccion').value,
        fechaNacimiento: document.getElementById('alumnoFechaNacimiento').value || null,
        email: document.getElementById('alumnoEmail').value || null,
        estado: document.getElementById('alumnoEstado').value,
    };

    try {
        if (id) {
            await llamarApi('/alumnos/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/alumnos', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalAlumno');
        mostrarExito('Alumno guardado correctamente');
        cargarAlumnos();
    } catch (err) {
        if (err.message.includes('Ya existe un alumno con ese DNI')) {
            cerrarModal('modalAlumno');
            abrirModal('modalDniDuplicado');
        } else {
            alert('Error: ' + err.message);
        }
    }
});

cargarAlumnos();
