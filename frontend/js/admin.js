const currentUser = obtenerUsuario();
if (currentUser?.rol !== 'ADMIN') window.location.href = '/pages/dashboard.html';

async function cargarStatsPagos() {
    const pagos = await llamarApi('/pagos');
    if (!pagos) return;

    const pendientes = [];
    const pagados = [];
    const vencidos = [];
    const cancelados = [];

    // separo los pagos por estado
    for (let i = 0; i < pagos.length; i++) {
        const p = pagos[i];
        if (p.estado === 'PENDIENTE') pendientes.push(p);
          else if (p.estado === 'PAGADO') pagados.push(p);
        else if (p.estado === 'VENCIDO') vencidos.push(p);
       else if (p.estado === 'CANCELADO') cancelados.push(p);
    }

    let totalRecaudado = 0;
    for (let i = 0; i < pagados.length; i++) {
        totalRecaudado += pagados[i].importe || 0;
    }

    let totalPendiente = 0;
    for (let i = 0; i < pendientes.length; i++) {
        totalPendiente += pendientes[i].importe || 0;
    }

    const stats = [
        { number: totalRecaudado.toFixed(2) + ' €', label: 'Total Recaudado', sub: pagados.length + ' pagos', color: 'success' },
        { number: pendientes.length, label: 'Pagos Pendientes', sub: totalPendiente.toFixed(2) + ' €', color: 'warning' },
        { number: vencidos.length, label: 'Pagos Vencidos', sub: '', color: 'danger' },
        { number: cancelados.length, label: 'Pagos Cancelados', sub: '', color: 'secondary' },
    ];

    let html = '';
    for (let i = 0; i < stats.length; i++) {
        const s = stats[i];
        const fontSize = typeof s.number === 'string' ? '1.6rem' : '2.5rem';
        const subHtml = s.sub ? '<div class="stat-sub">' + s.sub + '</div>' : '';
        html += '<div class="stat-card">';
        html += '<div class="stat-number stat-' + s.color + '" style="font-size:' + fontSize + '">' + s.number + '</div>';
        html += '<div class="stat-label">' + s.label + '</div>';
        html += subHtml;
        html += '</div>';
    }
    document.getElementById('statsPagos').innerHTML = html;
}

async function cargarVencidos() {
    const pagos = await llamarApi('/pagos');
    const tbody = document.getElementById('tbodyVencidos');

    const vencidos = [];
    if (pagos) {
        for (let i = 0; i < pagos.length; i++) {
            if (pagos[i].estado === 'VENCIDO') vencidos.push(pagos[i]);
        }
    }

    if (vencidos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No hay pagos vencidos</td></tr>';
        return;
    }

    let html = '';
    for (let i = 0; i < vencidos.length; i++) {
        const p = vencidos[i];
        const nombre = p.alumno ? p.alumno.nombre + ' ' + p.alumno.apellidos : '-';
        html += '<tr>';
        html += '<td>' + nombre + '</td>';
        html += '<td>' + (p.concepto || '-') + '</td>';
        html += '<td>' + p.importe + ' €</td>';
        html += '<td><span style="color:#dc2626;font-weight:600">' + (p.fechaVencimiento || '-') + '</span></td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

// tabla con cuántos alumnos tiene cada curso y el porcentaje de ocupación
async function cargarOcupacion() {
    const cursos = await llamarApi('/cursos');
    const matriculas = await llamarApi('/matriculas');
    const tbody = document.getElementById('tbodyOcupacion');

    if (!cursos || cursos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No hay cursos</td></tr>';
        return;
    }

    // cuento cuántos alumnos tiene cada curso mirando las matrículas
    const countPorCurso = {};
    if (matriculas) {
        for (let i = 0; i < matriculas.length; i++) {
            const m = matriculas[i];
            if (m.curso && m.curso.id) {
                if (countPorCurso[m.curso.id] === undefined) {
                    countPorCurso[m.curso.id] = 0;
                }
                countPorCurso[m.curso.id] = countPorCurso[m.curso.id] + 1;
            }
        }
    }

    let html = '';
    for (let i = 0; i < cursos.length; i++) {
        const c = cursos[i];
        const inscritos = countPorCurso[c.id] || 0;
        const capacidad = c.capacidad || null;
        const pct = capacidad ? Math.round((inscritos / capacidad) * 100) : null;

        let barColor = '#2563eb';
        if (pct !== null) {
            if (pct >= 90) barColor = '#dc2626';
            else if (pct >= 70) barColor = '#d97706';
            else barColor = '#16a34a';
        }
        const barWidth = pct !== null ? Math.min(pct, 100) : 0;

        const profesorNombre = c.profesor ? c.profesor.nombre + ' ' + c.profesor.apellidos : '-';
        const capacidadTexto = capacidad !== null ? capacidad : 'Sin límite';

        let barHtml = '-';
        if (capacidad) {
            barHtml = '<div style="background:#e2e8f0;border-radius:999px;height:8px;overflow:hidden">';
            barHtml += '<div style="background:' + barColor + ';width:' + barWidth + '%;height:100%;border-radius:999px"></div>';
            barHtml += '</div>';
            barHtml += '<span style="font-size:0.78rem;color:#64748b">' + pct + '%</span>';
        }

        html += '<tr>';
        html += '<td>' + c.nombre + '</td>';
        html += '<td>' + profesorNombre + '</td>';
        html += '<td><strong>' + inscritos + '</strong></td>';
        html += '<td>' + capacidadTexto + '</td>';
        html += '<td style="min-width:120px">' + barHtml + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function cargarAdmins() {
    const usuarios = await llamarApi('/admin/usuarios');
    const tbody = document.getElementById('tbodyAdmins');

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No hay usuarios</td></tr>';
        return;
    }

    let html = '';
    for (let i = 0; i < usuarios.length; i++) {
        const u = usuarios[i];
        const fechaTexto = u.createdAt ? u.createdAt.substring(0, 10) : '-';
        let accionHtml;
        // no puede borrarse a sí mismo
        if (u.username !== currentUser.username) {
            accionHtml = '<button class="btn btn-sm btn-icon btn-danger" onclick="eliminarAdmin(' + u.id + ', \'' + u.username + '\')">Borrar</button>';
        } else {
            accionHtml = '<span style="color:#64748b;font-size:0.8rem">Tú</span>';
        }
        html += '<tr>';
        html += '<td>' + u.id + '</td>';
        html += '<td>' + u.username + '</td>';
        html += '<td>' + (u.email || '-') + '</td>';
        html += '<td><span class="badge badge-' + u.rol.toLowerCase() + '">' + u.rol + '</span></td>';
        html += '<td>' + fechaTexto + '</td>';
        html += '<td class="actions-cell">' + accionHtml + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function eliminarAdmin(id, username) {
    if (!await confirmarAccion('¿Eliminar administrador "' + username + '"?', 'Eliminar administrador')) return;
    try {
        await llamarApi('/admin/usuarios/' + id, { method: 'DELETE' });
        mostrarExito('Administrador eliminado');
        cargarAdmins();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

document.getElementById('btnNuevoAdmin').addEventListener('click', function() {
    document.getElementById('formAdmin').reset();
    abrirModal('modalAdmin');
});

document.getElementById('formAdmin').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        await llamarApi('/admin/usuarios', {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById('adminUsername').value,
                password: document.getElementById('adminPassword').value,
                email:    document.getElementById('adminEmail').value,
                rol:      document.getElementById('adminRol').value
            })
        });
        cerrarModal('modalAdmin');
        cargarAdmins();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarStatsPagos();
cargarVencidos();
cargarOcupacion();
cargarAdmins();
