const user = obtenerUsuario();
const isAdmin = user?.rol === 'ADMIN';

// solo el admin puede crear o modificar cursos
if (!isAdmin) document.getElementById('btnNuevoCurso').style.display = 'none';

// cargo los profesores en el select del formulario
async function cargarProfesoresSelect() {
    var profesores = await llamarApi('/profesores');
    const select = document.getElementById('cursoProfesor');
    if (profesores) {
        for (var i = 0; i < profesores.length; i++) {
            var opt = document.createElement('option');
            opt.value = profesores[i].id;
            opt.textContent = profesores[i].nombre + ' ' + profesores[i].apellidos;
            select.appendChild(opt);
        }
    }
}

async function cargarCursos() {
    const tbody = document.getElementById('tbodyCursos');
    var cursos = await llamarApi('/cursos');
    if (!cursos || cursos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No hay cursos registrados</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < cursos.length; i++) {
        var c = cursos[i];
        var acciones = '';
        if (isAdmin) {
            acciones += '<button class="btn btn-sm btn-icon" onclick="editarCurso(' + c.id + ')">Editar</button>';
            acciones += '<button class="btn btn-sm btn-icon btn-danger" onclick="eliminarCurso(' + c.id + ')">Borrar</button>';
        }
        // si el curso no tiene profesor asignado pongo un guión
        var profesor = c.profesor ? c.profesor.nombre + ' ' + c.profesor.apellidos : '-';
        html += '<tr>';
        html += '<td>' + c.id + '</td>';
        html += '<td>' + c.nombre + '</td>';
        html += '<td>' + (c.nivel || '-') + '</td>';
        html += '<td>' + (c.capacidad || '-') + '</td>';
        html += '<td>' + (c.precio ? c.precio + '€' : '-') + '</td>';
        html += '<td>' + profesor + '</td>';
        html += '<td><span class="badge badge-' + (c.estado ? c.estado.toLowerCase() : '') + '">' + c.estado + '</span></td>';
        html += '<td class="actions-cell">' + acciones + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

document.getElementById('btnNuevoCurso')?.addEventListener('click', () => {
    document.getElementById('formCurso').reset();
    document.getElementById('cursoId').value = '';
    document.getElementById('modalCursoTitle').textContent = 'Nuevo Curso';
    abrirModal('modalCurso');
});

async function editarCurso(id) {
    // en este caso sí llamo a la api porque necesito todos los datos del curso
    const c = await llamarApi('/cursos/' + id);
    document.getElementById('cursoId').value = c.id;
    document.getElementById('cursoNombre').value = c.nombre;
    document.getElementById('cursoNivel').value = c.nivel || '';
    document.getElementById('cursoCapacidad').value = c.capacidad || '';
    document.getElementById('cursoPrecio').value = c.precio || '';
    document.getElementById('cursoProfesor').value = c.profesor?.id || '';
    document.getElementById('cursoEstado').value = c.estado;
    document.getElementById('cursoDescripcion').value = c.descripcion || '';
    document.getElementById('modalCursoTitle').textContent = 'Editar Curso';
    abrirModal('modalCurso');
}

async function eliminarCurso(id) {
    if (!await confirmarAccion('¿Eliminar este curso?', 'Eliminar curso')) return;
    await llamarApi('/cursos/' + id, { method: 'DELETE' });
    mostrarExito('Curso eliminado');
    cargarCursos();
}

document.getElementById('formCurso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cursoId').value;
    const profesorId = document.getElementById('cursoProfesor').value;

    const body = {
        nombre: document.getElementById('cursoNombre').value,
        nivel: document.getElementById('cursoNivel').value,
        // si está vacío mando null, sino el backend lo guarda como string vacío
        capacidad: document.getElementById('cursoCapacidad').value || null,
        precio: document.getElementById('cursoPrecio').value || null,
        descripcion: document.getElementById('cursoDescripcion').value,
        estado: document.getElementById('cursoEstado').value,
        profesor: profesorId ? { id: parseInt(profesorId) } : null
    };

    try {
        if (id) {
            await llamarApi('/cursos/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/cursos', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalCurso');
        cargarCursos();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarProfesoresSelect();
cargarCursos();
