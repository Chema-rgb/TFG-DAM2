const user = obtenerUsuario();
const isAdmin = user?.rol === 'ADMIN';

if (!isAdmin) document.getElementById('btnNuevaMatricula').style.display = 'none';

// cargo alumnos y cursos en los selects del formulario
async function cargarSelects() {
    var alumnos = await llamarApi('/alumnos');
    var cursos = await llamarApi('/cursos');
    const selAlumno = document.getElementById('matriculaAlumno');
    const selCurso = document.getElementById('matriculaCurso');

    if (alumnos) {
        for (var i = 0; i < alumnos.length; i++) {
            var opt = document.createElement('option');
            opt.value = alumnos[i].id;
            opt.textContent = alumnos[i].nombre + ' ' + alumnos[i].apellidos;
            selAlumno.appendChild(opt);
        }
    }
    if (cursos) {
        for (var j = 0; j < cursos.length; j++) {
            var opt2 = document.createElement('option');
            opt2.value = cursos[j].id;
            opt2.textContent = cursos[j].nombre;
            selCurso.appendChild(opt2);
        }
    }
}

async function cargarMatriculas() {
    const tbody = document.getElementById('tbodyMatriculas');
    var matriculas = await llamarApi('/matriculas');
    if (!matriculas || matriculas.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No hay matrículas registradas</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < matriculas.length; i++) {
        var m = matriculas[i];
        var acciones = '';
        if (isAdmin) {
            acciones += '<button class="btn btn-sm btn-icon" onclick="editarMatricula(' + m.id + ')">Editar</button>';
            acciones += '<button class="btn btn-sm btn-icon btn-danger" onclick="eliminarMatricula(' + m.id + ')">Borrar</button>';
        }
        var nombreAlumno = m.alumno ? m.alumno.nombre + ' ' + m.alumno.apellidos : '-';
        html += '<tr>';
        html += '<td>' + m.id + '</td>';
        html += '<td>' + nombreAlumno + '</td>';
        html += '<td>' + (m.curso ? m.curso.nombre : '-') + '</td>';
        html += '<td>' + (m.fechaMatricula || '-') + '</td>';
        html += '<td><span class="badge badge-' + (m.estado ? m.estado.toLowerCase() : '') + '">' + m.estado + '</span></td>';
        html += '<td class="actions-cell">' + acciones + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

document.getElementById('btnNuevaMatricula')?.addEventListener('click', () => {
    document.getElementById('formMatricula').reset();
    document.getElementById('matriculaId').value = '';
    document.getElementById('modalMatriculaTitle').textContent = 'Nueva Matrícula';
    abrirModal('modalMatricula');
});

async function editarMatricula(id) {
    // recargo todas las matriculas y busco la que quiero editar
    var matriculas = await llamarApi('/matriculas');
    const m = matriculas.find(x => x.id === id);
    if (!m) return;
    document.getElementById('matriculaId').value = m.id;
    document.getElementById('matriculaAlumno').value = m.alumno?.id || '';
    document.getElementById('matriculaCurso').value = m.curso?.id || '';
    document.getElementById('matriculaEstado').value = m.estado;
    document.getElementById('modalMatriculaTitle').textContent = 'Editar Matrícula';
    abrirModal('modalMatricula');
}

async function eliminarMatricula(id) {
    if (!await confirmarAccion('¿Eliminar esta matrícula?', 'Eliminar matrícula')) return;
    await llamarApi('/matriculas/' + id, { method: 'DELETE' });
    mostrarExito('Matrícula eliminada');
    cargarMatriculas();
}

document.getElementById('formMatricula').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('matriculaId').value;

    const body = {
        alumno: { id: parseInt(document.getElementById('matriculaAlumno').value) },
        curso: { id: parseInt(document.getElementById('matriculaCurso').value) },
        estado: document.getElementById('matriculaEstado').value
    };

    try {
        if (id) {
            await llamarApi('/matriculas/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/matriculas', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalMatricula');
        cargarMatriculas();
    } catch (err) {
        // el backend devuelve CURSO_COMPLETO cuando no hay plazas
        if (err.message.includes('CURSO_COMPLETO')) {
            cerrarModal('modalMatricula');
            abrirModal('modalCursoCompleto');
        } else {
            alert('Error: ' + err.message);
        }
    }
});

cargarSelects();
cargarMatriculas();
