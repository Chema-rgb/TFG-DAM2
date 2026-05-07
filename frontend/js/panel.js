const user = obtenerUsuario();

async function cargarEstadisticas() {
    const statsGrid = document.getElementById('statsGrid');
    const actionsGrid = document.getElementById('actionsGrid');
    const titulo = document.getElementById('panelTitulo');
    const bienvenida = document.getElementById('bienvenidaProfesor');
    const bienvenidaTexto = document.getElementById('bienvenidaTexto');

    var stats = [];
    var actions = [];

    if (user.rol === 'ADMIN') {
        titulo.textContent = 'Panel de Administración';
        // el admin ve todos los contadores
        var alumnos = await llamarApi('/alumnos');
        var profesores = await llamarApi('/profesores');
        var cursos = await llamarApi('/cursos');
        var pagos = await llamarApi('/pagos');

        stats.push({ number: alumnos ? alumnos.length : 0, label: 'Alumnos' });
        stats.push({ number: profesores ? profesores.length : 0, label: 'Profesores' });
        stats.push({ number: cursos ? cursos.length : 0, label: 'Cursos' });
        stats.push({ number: pagos ? pagos.length : 0, label: 'Pagos Totales' });

        actions.push({ icon: '👨‍🎓', label: 'Alumnos', href: 'alumnos.html' });
        actions.push({ icon: '👨‍🏫', label: 'Profesores', href: 'profesores.html' });
        actions.push({ icon: '📚', label: 'Cursos', href: 'cursos.html' });
        actions.push({ icon: '📋', label: 'Matrículas', href: 'matricula.html' });
        actions.push({ icon: '💰', label: 'Pagos', href: 'pagos_lista.html' });
        actions.push({ icon: '⚙️', label: 'Administración', href: 'admin.html' });

    } else if (user.rol === 'PROFESOR') {
        titulo.textContent = 'Panel del Profesor';

        // mostramos un saludo con el nombre del profesor
        bienvenida.style.display = 'block';
        bienvenidaTexto.textContent = 'Bienvenido, ' + user.username + '. Desde aquí puedes consultar los alumnos, cursos y matrículas.';

        var alumnos = await llamarApi('/alumnos');
        var cursos = await llamarApi('/cursos');
        var matriculas = await llamarApi('/matriculas');

        stats.push({ number: alumnos ? alumnos.length : 0, label: 'Total Alumnos' });
        stats.push({ number: cursos ? cursos.length : 0, label: 'Total Cursos' });
        stats.push({ number: matriculas ? matriculas.length : 0, label: 'Matrículas' });

        actions.push({ icon: '👨‍🎓', label: 'Alumnos', href: 'alumnos.html' });
        actions.push({ icon: '📚', label: 'Cursos', href: 'cursos.html' });
        actions.push({ icon: '📋', label: 'Matrículas', href: 'matricula.html' });

    } else {
        // panel del alumno: solo acceso a su perfil
        titulo.textContent = 'Panel del Alumno';

        var perfil = await llamarApi('/alumnos/me');
        if (perfil) {
            bienvenida.style.display = 'block';
            bienvenidaTexto.textContent = 'Hola ' + perfil.nombre + ', desde aquí puedes consultar tu información.';
        }

        actions.push({ icon: '👤', label: 'Mi perfil', href: 'mi_perfil.html' });
    }

    var htmlStats = '';
    for (var i = 0; i < stats.length; i++) {
        htmlStats += '<div class="stat-card">';
        htmlStats += '<div class="stat-number">' + stats[i].number + '</div>';
        htmlStats += '<div class="stat-label">' + stats[i].label + '</div>';
        htmlStats += '</div>';
    }
    statsGrid.innerHTML = htmlStats;

    var htmlActions = '';
    for (var j = 0; j < actions.length; j++) {
        htmlActions += '<div class="action-card" onclick="location.href=\'' + actions[j].href + '\'">';
        htmlActions += '<div class="action-icon">' + actions[j].icon + '</div>';
        htmlActions += '<div class="action-label">' + actions[j].label + '</div>';
        htmlActions += '</div>';
    }
    actionsGrid.innerHTML = htmlActions;
}

cargarEstadisticas();
