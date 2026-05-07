// funciones comunes que uso en todas las páginas

const API = 'http://127.0.0.1:8082/api';

function obtenerToken() { return localStorage.getItem('token'); }
function obtenerUsuario() { return JSON.parse(localStorage.getItem('user') || 'null'); }

function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html';
}

async function salir() {
    if (!await confirmarAccion('¿Cerrar sesión?', 'Salir', 'Salir')) return;
    cerrarSesion();
}

function verificarAcceso() {
    if (!obtenerToken()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// compruebo que el usuario tenga uno de los roles que se le pasan
function verificarRol(...roles) {
    var user = obtenerUsuario();
    if (!user || !roles.includes(user.rol)) {
        window.location.href = '/pages/dashboard.html';
        return false;
    }
    return true;
}

// llamada genérica al backend, la uso desde todas las páginas para no repetir el fetch
async function llamarApi(path, opts) {
    var metodo = opts ? opts.method || 'GET' : 'GET';
    var cuerpo = opts ? opts.body : null;
    var tok = obtenerToken();

    var cabeceras = { 'Content-Type': 'application/json' };
    if (tok) cabeceras['Authorization'] = 'Bearer ' + tok;

    var res = await fetch(API + path, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo || null
    });

    if (res.status === 401) { cerrarSesion(); return null; } // token caducado
    if (!res.ok) {
        var msg = await res.text();
        throw new Error(msg || 'Error en la petición');
    }
    if (res.status === 204) return null;
    return res.json();
}

function construirMenu() {
    const user = obtenerUsuario();
    if (!user) return;

    const navUsername = document.getElementById('navUsername');
    const navRol = document.getElementById('navRol');
    const navLinks = document.getElementById('navLinks');

    if (navUsername) navUsername.textContent = user.username;
    if (navRol) {
        navRol.textContent = user.rol;
        navRol.className = 'badge badge-' + user.rol.toLowerCase();
    }

    if (!navLinks) return;

    const links = [
        { href: 'dashboard.html', label: 'Panel', roles: ['ADMIN', 'PROFESOR', 'ALUMNO'] },
        { href: 'alumnos.html', label: 'Alumnos', roles: ['ADMIN', 'PROFESOR'] },
        { href: 'profesores.html', label: 'Profesores', roles: ['ADMIN'] },
        { href: 'cursos.html', label: 'Cursos', roles: ['ADMIN', 'PROFESOR'] },
        { href: 'matricula.html', label: 'Matrículas', roles: ['ADMIN', 'PROFESOR'] },
        { href: 'pagos_lista.html', label: 'Pagos', roles: ['ADMIN'] },
        { href: 'admin.html', label: 'Administración', roles: ['ADMIN'] },
        // enlaces propios del alumno
        { href: 'mi_perfil.html', label: 'Mi perfil', roles: ['ALUMNO'] },
    ];

    links.filter(l => l.roles.includes(user.rol)).forEach(function(l) {
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        if (window.location.pathname.endsWith(l.href)) a.classList.add('active');
        navLinks.appendChild(a);
    });
}

function mostrarExito(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast-ok';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { document.body.removeChild(toast); }, 2500); // desaparece solo
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

function abrirModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function confirmarAccion(mensaje, titulo, textoOk) {
    return new Promise(function(resolve) {
        var prev = document.getElementById('modalConfirmar');
        if (prev) prev.remove();

        var overlay = document.createElement('div');
        overlay.className = 'modal';
        overlay.id = 'modalConfirmar';
        overlay.style.display = 'flex';
        overlay.innerHTML =
            '<div class="modal-content" style="max-width:400px;text-align:center">' +
                '<div style="padding:2rem 1.5rem">' +
                    '<div style="font-size:3rem;margin-bottom:1rem">⚠️</div>' +
                    '<h3 style="color:var(--danger);margin-bottom:0.75rem"></h3>' +
                    '<p style="color:var(--text-light);margin-bottom:1.5rem"></p>' +
                    '<div style="display:flex;gap:0.5rem;justify-content:center">' +
                        '<button type="button" class="btn" id="btnConfirmarNo">Cancelar</button>' +
                        '<button type="button" class="btn btn-danger" id="btnConfirmarSi"></button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        overlay.querySelector('h3').textContent = titulo || 'Confirmar';
        overlay.querySelector('p').textContent = mensaje || '¿Estás seguro?';
        overlay.querySelector('#btnConfirmarSi').textContent = textoOk || 'Eliminar';
        document.body.appendChild(overlay);

        function cerrar(valor) {
            overlay.remove();
            resolve(valor);
        }
        overlay.querySelector('#btnConfirmarSi').onclick = function() { cerrar(true); };
        overlay.querySelector('#btnConfirmarNo').onclick = function() { cerrar(false); };
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const errorEl = document.getElementById('loginError');
        errorEl.style.display = 'none';
        try {
            const res = await fetch(API + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                })
            });
            if (!res.ok) throw new Error('Credenciales incorrectas');
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ username: data.username, rol: data.rol }));
            window.location.replace('/pages/dashboard.html');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });
} else {
    // si no es el login compruebo que haya sesión y construyo el menú
    if (!obtenerToken()) {
        window.location.replace('/index.html');
    } else {
        construirMenu();
    }
}
