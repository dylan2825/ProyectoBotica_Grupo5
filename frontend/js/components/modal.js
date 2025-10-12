class Modal {
    static mostrar(contenido) {
        let modal = document.getElementById('modal-global');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-global';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-close" onclick="Modal.cerrar()">×</div>
                    <div id="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        document.getElementById('modal-body').innerHTML = contenido;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    static cerrar() {
        const modal = document.getElementById('modal-global');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        Modal.cerrar();
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        Modal.cerrar();
    }
});