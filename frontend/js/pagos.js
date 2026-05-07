// cargo los selects de alumno y curso para el formulario de nuevo pago
async function cargarSelects() {
    var alumnos = await llamarApi('/alumnos');
    var cursos = await llamarApi('/cursos');
    const selAlumno = document.getElementById('pagoAlumno');
    const selCurso = document.getElementById('pagoCurso');
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

// guardo todos los pagos aquí para filtrar sin llamar al backend cada vez
var todosPagos = [];

// cada botón llama a esto con su estado
function filtrarPorEstado(estado) {
    var filtrados = [];
    if (estado === 'TODOS') {
        filtrados = todosPagos;
    } else {
        for (var i = 0; i < todosPagos.length; i++) {
            if (todosPagos[i].estado === estado) filtrados.push(todosPagos[i]);
        }
    }
    mostrarPagos(filtrados);
}

function mostrarPagos(pagos) {
    const tbody = document.getElementById('tbodyPagos');
    if (!pagos || pagos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No hay pagos</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < pagos.length; i++) {
        var p = pagos[i];
        var nombreAlumno = p.alumno ? p.alumno.nombre + ' ' + p.alumno.apellidos : '-';
        html += '<tr>';
        html += '<td>' + p.id + '</td>';
        html += '<td>' + nombreAlumno + '</td>';
        html += '<td>' + (p.curso ? p.curso.nombre : '-') + '</td>';
        html += '<td>' + (p.concepto || '-') + '</td>';
        html += '<td>' + p.importe + '€</td>';
        html += '<td>' + (p.fechaPago || '-') + '</td>';
        html += '<td>' + (p.fechaVencimiento || '-') + '</td>';
        html += '<td><span class="badge badge-' + (p.estado ? p.estado.toLowerCase() : '') + '">' + p.estado + '</span></td>';
        html += '<td class="actions-cell">';
        html += '<button class="btn btn-sm btn-icon" onclick="editarPago(' + p.id + ')">Editar</button>';
        html += '<button class="btn btn-sm btn-icon btn-danger" onclick="eliminarPago(' + p.id + ')">Borrar</button>';
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function cargarPagos() {
    var pagos = await llamarApi('/pagos');
    todosPagos = pagos || [];
    mostrarPagos(todosPagos);
}

document.getElementById('btnNuevoPago').addEventListener('click', () => {
    document.getElementById('formPago').reset();
    document.getElementById('pagoId').value = '';
    document.getElementById('modalPagoTitle').textContent = 'Registrar Pago';
    abrirModal('modalPago');
});

async function editarPago(id) {
    // aquí sí llamo directo a la api con el id del pago
    const p = await llamarApi('/pagos/' + id);
    if (!p) return;
    document.getElementById('pagoId').value = p.id;
    document.getElementById('pagoAlumno').value = p.alumno?.id || '';
    document.getElementById('pagoCurso').value = p.curso?.id || '';
    document.getElementById('pagoConcepto').value = p.concepto || '';
    document.getElementById('pagoImporte').value = p.importe;
    document.getElementById('pagoFecha').value = p.fechaPago || '';
    document.getElementById('pagoVencimiento').value = p.fechaVencimiento || '';
    document.getElementById('pagoEstado').value = p.estado;
    document.getElementById('pagoObservaciones').value = p.observaciones || '';
    document.getElementById('modalPagoTitle').textContent = 'Editar Pago';
    abrirModal('modalPago');
}

async function eliminarPago(id) {
    if (!await confirmarAccion('¿Eliminar este pago?', 'Eliminar pago')) return;
    await llamarApi('/pagos/' + id, { method: 'DELETE' });
    mostrarExito('Pago eliminado');
    cargarPagos();
}

document.getElementById('formPago').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pagoId').value;
    const cursoId = document.getElementById('pagoCurso').value;

    const body = {
        alumno: { id: parseInt(document.getElementById('pagoAlumno').value) },
        // el curso puede ser null si el pago no está ligado a ningún curso
        curso: cursoId ? { id: parseInt(cursoId) } : null,
        concepto: document.getElementById('pagoConcepto').value,
        importe: parseFloat(document.getElementById('pagoImporte').value),
        fechaPago: document.getElementById('pagoFecha').value || null,
        fechaVencimiento: document.getElementById('pagoVencimiento').value || null,
        estado: document.getElementById('pagoEstado').value,
        observaciones: document.getElementById('pagoObservaciones').value
    };

    try {
        if (id) {
            await llamarApi('/pagos/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/pagos', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalPago');
        cargarPagos();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarSelects();
cargarPagos();
