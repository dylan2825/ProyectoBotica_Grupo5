class Alertas {
    constructor() {
        this.alertas = [];
    }

    async render() {
        return `
            <div class="alertas-module">
                <div class="page-header">
                    <h1>Sistema de Alertas</h1>
                    <p>Gestiona las notificaciones del sistema</p>
                </div>

                <div class="alertas-filters card">
                    <div class="card-header">
                        <h3 class="card-title">Alertas del Sistema</h3>
                        <button class="btn btn-outline" onclick="alertas.marcarTodasLeidas()">
                            Marcar todas como leídas
                        </button>
                    </div>
                </div>

                <div class="alertas-list-container">
                    <div id="lista-alertas">
                        <div class="empty-state card">
                            <div class="empty-icon">🔔</div>
                            <h3>Cargando alertas...</h3>
                            <p>Espere mientras se cargan las notificaciones</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeEvents() {
        await this.cargarAlertas();
    }

    async cargarAlertas() {
        try {
            const result = await api.getAlertas();
            if (result.success) {
                this.alertas = result.data;
                this.renderAlertas();
            }
        } catch (error) {
            console.error('Error cargando alertas:', error);
            this.renderAlertasDemo();
        }
    }

    renderAlertas() {
        const container = document.getElementById('lista-alertas');
        
        if (!this.alertas || this.alertas.length === 0) {
            container.innerHTML = `
                <div class="empty-state card">
                    <div class="empty-icon">🔔</div>
                    <h3>No hay alertas</h3>
                    <p>No se encontraron alertas pendientes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.alertas.map(alerta => `
            <div class="alerta-card card ${alerta.prioridad}">
                <div class="alerta-header">
                    <div class="alerta-title">
                        <span class="alerta-icon">${this.getPriorityIcon(alerta.prioridad)}</span>
                        <h4>${alerta.titulo}</h4>
                        <span class="priority-badge ${alerta.prioridad}">${alerta.prioridad}</span>
                    </div>
                    <div class="alerta-meta">
                        ${!alerta.leida ? `
                            <button class="btn btn-sm btn-outline" 
                                    onclick="alertas.marcarLeida('${alerta.id}')">
                                Marcar leída
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="alerta-body">
                    <p>${alerta.descripcion}</p>
                </div>
            </div>
        `).join('');
    }

    renderAlertasDemo() {
        const container = document.getElementById('lista-alertas');
        container.innerHTML = `
            <div class="alerta-card card alta">
                <div class="alerta-header">
                    <div class="alerta-title">
                        <span class="alerta-icon">🔴</span>
                        <h4>Stock Crítico</h4>
                        <span class="priority-badge alta">Alta</span>
                    </div>
                    <div class="alerta-meta">
                        <button class="btn btn-sm btn-outline">Marcar leída</button>
                    </div>
                </div>
                <div class="alerta-body">
                    <p>El producto "Amoxicilina 500mg" tiene stock bajo (5 unidades)</p>
                </div>
            </div>
        `;
    }

    getPriorityIcon(prioridad) {
        const icons = { alta: '🔴', media: '🟡', baja: '🔵' };
        return icons[prioridad] || '⚪';
    }

    async marcarLeida(id) {
        try {
            await api.marcarAlertaLeida(id);
            notificaciones.mostrar('Alerta marcada como leída', 'success');
            await this.cargarAlertas();
        } catch (error) {
            notificaciones.mostrar('Error al marcar alerta', 'error');
        }
    }

    async marcarTodasLeidas() {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }
}

const alertas = new Alertas();