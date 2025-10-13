// Utilidades generales para la aplicación

// Formateadores
function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(monto);
}

function formatearFecha(fechaString) {
    if (!fechaString) return 'N/A';
    
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatearFechaInput(fecha) {
    if (!fecha) return '';
    
    const dateObj = new Date(fecha);
    return dateObj.toISOString().split('T')[0];
}

function formatearHora(fechaString) {
    if (!fechaString) return 'N/A';
    
    const fecha = new Date(fechaString);
    return fecha.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Notificaciones y UI
function mostrarExito(mensaje) {
    mostrarNotificacion(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <span class="notificacion-mensaje">${mensaje}</span>
            <button class="notificacion-cerrar" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Estilos básicos para notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#d4edda' : tipo === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${tipo === 'success' ? '#155724' : tipo === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 5px;
        border: 1px solid ${tipo === 'success' ? '#c3e6cb' : tipo === 'error' ? '#f5c6cb' : '#bee5eb'};
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(notificacion);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.remove();
        }
    }, 5000);
}

function mostrarLoading(mostrar) {
    let loading = document.getElementById('globalLoading');
    
    if (!loading && mostrar) {
        loading = document.createElement('div');
        loading.id = 'globalLoading';
        loading.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
        
        // Estilos básicos para loading
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        document.body.appendChild(loading);
    } else if (loading && !mostrar) {
        loading.remove();
    }
}

// Validaciones
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefono(telefono) {
    const regex = /^[0-9+\-\s()]{7,15}$/;
    return regex.test(telefono);
}

function validarSoloNumeros(texto) {
    return /^\d+$/.test(texto);
}

// Utilidades de arrays y objetos
function agruparPor(array, clave) {
    return array.reduce((grupos, item) => {
        const valor = item[clave];
        if (!grupos[valor]) {
            grupos[valor] = [];
        }
        grupos[valor].push(item);
        return grupos;
    }, {});
}

function ordenarPor(array, clave, orden = 'asc') {
    return array.sort((a, b) => {
        let aVal = a[clave];
        let bVal = b[clave];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (orden === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// Manejo de localStorage con seguridad
function guardarEnLocalStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

function obtenerDeLocalStorage(clave) {
    try {
        const item = localStorage.getItem(clave);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error leyendo de localStorage:', error);
        return null;
    }
}

// Utilidades de fechas
function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function restarDias(fecha, dias) {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() - dias);
    return resultado;
}

// Manejo de errores
function manejarError(error, mensajePersonalizado = 'Ocurrió un error') {
    console.error('Error:', error);
    
    if (error.response && error.response.status === 401) {
        // Token expirado, redirigir a login
        localStorage.removeItem('token');
        window.location.href = 'index.html';
        return;
    }
    
    mostrarError(mensajePersonalizado);
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatearMoneda,
        formatearFecha,
        mostrarExito,
        mostrarError,
        mostrarLoading,
        validarEmail,
        validarTelefono,
        guardarEnLocalStorage,
        obtenerDeLocalStorage,
        manejarError
    };
}