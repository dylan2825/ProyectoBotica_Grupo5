class Notificaciones {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    mostrar(mensaje, tipo = 'success', duracion = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${mensaje}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duracion);
    }
}

const notificaciones = new Notificaciones();