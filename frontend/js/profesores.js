const user = obtenerUsuario();
const isAdmin = user?.rol === 'ADMIN';

// los profesores no pueden crear ni borrar otros profesores
if (!isAdmin) document.getElementById('btnNuevoProfesor').style.display = 'none';

var todosProfesores = [];

function buscar(texto) {
    if (!texto) {
        mostrarProfesores(todosProfesores);
        return;
    }
    var filtrados = [];
    for (var i = 0; i < todosProfesores.length; i++) {
        var p = todosProfesores[i];
        // busco por nombre o apellidos
        if (p.nombre.toLowerCase().includes(texto.toLowerCase()) ||
            p.apellidos.toLowerCase().includes(texto.toLowerCase())) {
            filtrados.push(p);
        }
    }
    mostrarProfesores(filtrados);
}

function mostrarProfesores(profesores) {
    const tbody = document.getElementById('tbodyProfesores');
    if (!profesores || profesores.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No hay profesores registrados</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < profesores.length; i++) {
        var p = profesores[i];
        var acciones = '';
        if (isAdmin) {
            acciones += '<button class="btn btn-sm btn-icon" onclick="editarProfesor(' + p.id + ')">Editar</button>';
            acciones += '<button class="btn btn-sm btn-icon btn-danger" onclick="eliminarProfesor(' + p.id + ')">Borrar</button>';
        }
        html += '<tr>';
        html += '<td>' + p.id + '</td>';
        html += '<td>' + p.nombre + '</td>';
        html += '<td>' + p.apellidos + '</td>';
        html += '<td>' + (p.dni || '-') + '</td>';
        html += '<td>' + (p.telefono || '-') + '</td>';
        html += '<td>' + (p.especialidad || '-') + '</td>';
        html += '<td><span class="badge badge-' + (p.estado ? p.estado.toLowerCase() : '') + '">' + p.estado + '</span></td>';
        html += '<td class="actions-cell">' + acciones + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function cargarProfesores() {
    var profesores = await llamarApi('/profesores');
    todosProfesores = profesores || [];
    mostrarProfesores(todosProfesores);
}

document.getElementById('btnNuevoProfesor')?.addEventListener('click', () => {
    document.getElementById('formProfesor').reset();
    document.getElementById('profesorId').value = '';
    document.getElementById('modalProfesorTitle').textContent = 'Nuevo Profesor';
    abrirModal('modalProfesor');
});

// busco el profesor en el array local para no hacer otra llamada a la api
async function editarProfesor(id) {
    var p = todosProfesores.find(x => x.id === id);
    if (!p) return;
    document.getElementById('profesorId').value = p.id;
    document.getElementById('profesorNombre').value = p.nombre;
    document.getElementById('profesorApellidos').value = p.apellidos;
    document.getElementById('profesorDni').value = p.dni || '';
    document.getElementById('profesorTelefono').value = p.telefono || '';
    document.getElementById('profesorEspecialidad').value = p.especialidad || '';
    document.getElementById('profesorEmail').value = p.email || '';
    document.getElementById('profesorEstado').value = p.estado;
    document.getElementById('modalProfesorTitle').textContent = 'Editar Profesor';
    abrirModal('modalProfesor');
}

async function eliminarProfesor(id) {
    if (!await confirmarAccion('¿Eliminar este profesor?', 'Eliminar profesor')) return;
    await llamarApi('/profesores/' + id, { method: 'DELETE' });
    mostrarExito('Profesor eliminado');
    cargarProfesores();
}

document.getElementById('formProfesor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('profesorId').value;

    if (!document.getElementById('profesorNombre').value.trim()) {
        alert('El nombre es obligatorio');
        return;
    }
    if (!document.getElementById('profesorApellidos').value.trim()) {
        alert('Los apellidos son obligatorios');
        return;
    }

    const body = {
        nombre: document.getElementById('profesorNombre').value,
        apellidos: document.getElementById('profesorApellidos').value,
        dni: document.getElementById('profesorDni').value,
        telefono: document.getElementById('profesorTelefono').value,
        especialidad: document.getElementById('profesorEspecialidad').value,
        email: document.getElementById('profesorEmail').value || null,
        estado: document.getElementById('profesorEstado').value
    };

    try {
        if (id) {
            await llamarApi('/profesores/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/profesores', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalProfesor');
        mostrarExito('Profesor guardado correctamente');
        cargarProfesores();
    } catch (err) {
        // si el dni ya existe abro el modal de error específico
        if (err.message.includes('DNI')) {
            cerrarModal('modalProfesor');
            abrirModal('modalDniDuplicado');
        } else {
            alert('Error: ' + err.message);
        }
    }
});

cargarProfesores();
