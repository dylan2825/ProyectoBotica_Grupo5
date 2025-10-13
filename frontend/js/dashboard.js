// Dashboard functionality
class Dashboard {
    static async init() {
        if (!AuthManager.requireAuth()) return;

        this.loadUserInfo();
        await this.loadDashboardData();
        this.setupEventListeners();
    }

    static loadUserInfo() {
        const user = AuthManager.getUser();
        if (user) {
            document.getElementById('userName').textContent = user.nombre;
            document.getElementById('userRole').textContent = user.rol === 'admin' ? 'Administrador' : 'Cajero';
            document.getElementById('welcomeName').textContent = user.nombre.split(' ')[0];
        }
    }

    static async loadDashboardData() {
        try {
            await Promise.all([
                this.loadMetrics(),
                this.loadAlertas(),
                this.loadTopProducts(),
                this.loadSalesSummary()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Error al cargar los datos del dashboard');
        }
    }

    static async loadMetrics() {
        const data = await App.apiCall('/api/dashboard/metricas');
        
        if (data.success) {
            this.displayMetrics(data.data);
        }
    }

    static displayMetrics(metrics) {
        const metricsGrid = document.getElementById('metricsGrid');
        
        metricsGrid.innerHTML = `
            <div class="metric-card">
                <div class="metric-value">${metrics.ventas_hoy?.total_ventas || 0}</div>
                <div class="metric-label">Ventas Hoy</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">S/ ${(metrics.ventas_hoy?.ingresos || 0).toFixed(2)}</div>
                <div class="metric-label">Ingresos del Día</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.stock_bajo?.total || 0}</div>
                <div class="metric-label">Productos con Stock Bajo</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.alertas_pendientes?.total || 0}</div>
                <div class="metric-label">Alertas Pendientes</div>
            </div>
        `;
    }

    static async loadAlertas() {
        const data = await App.apiCall('/api/dashboard/alertas?leidas=false');
        
        if (data.success) {
            this.displayAlertas(data.data);
            this.updateNotificationCount(data.data.length);
        }
    }

    static displayAlertas(alertas) {
        const alertasList = document.getElementById('alertasList');
        const notificationsList = document.getElementById('notificationsList');

        if (alertas.length === 0) {
            alertasList.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--gray-500);">
                    🎉 No hay alertas pendientes
                </div>
            `;
            notificationsList.innerHTML = alertasList.innerHTML;
            return;
        }

        const alertaHTML = alertas.map(alerta => `
            <div class="alerta-item ${alerta.prioridad === 'alta' ? 'warning' : 'info'}">
                <div class="alerta-content">
                    <h4>${this.getAlertaTitle(alerta.tipo)}</h4>
                    <p>${alerta.mensaje}</p>
                    <div class="alerta-time">${new Date(alerta.creado_en).toLocaleString()}</div>
                </div>
            </div>
        `).join('');

        alertasList.innerHTML = alertaHTML;
        notificationsList.innerHTML = alertaHTML;
    }

    static getAlertaTitle(tipo) {
        const titles = {
            'stock_bajo': '📦 Stock Bajo',
            'venta_importante': '💰 Venta Importante'
        };
        return titles[tipo] || '🔔 Alerta del Sistema';
    }

    static updateNotificationCount(count) {
        const badge = document.getElementById('notificationCount');
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    static async loadTopProducts() {
        // Esto cargará desde las métricas del dashboard
        const productsList = document.getElementById('topProductsList');
        productsList.innerHTML = `
            <div class="product-item">
                <div class="product-info">
                    <h4>Paracetamol 500mg</h4>
                    <div class="sales-count">45 unidades vendidas</div>
                </div>
                <div class="product-sales">#1</div>
            </div>
            <div class="product-item">
                <div class="product-info">
                    <h4>Amoxicilina 500mg</h4>
                    <div class="sales-count">32 unidades vendidas</div>
                </div>
                <div class="product-sales">#2</div>
            </div>
        `;
    }

    static async loadSalesSummary() {
        // Datos de ejemplo - luego se conectarán con API real
        document.getElementById('todaySales').textContent = '6';
        document.getElementById('todayRevenue').textContent = 'S/ 559.30';
        document.getElementById('avgTicket').textContent = 'S/ 93.22';
    }

    static setupEventListeners() {
        // Event listeners adicionales si son necesarios
    }

    static showError(message) {
        console.error('Dashboard Error:', message);
        // Podríamos mostrar un toast de error aquí
    }
}

// Funciones globales para el dashboard
function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('show');
}

function logout() {
    AuthManager.logout();
}

function navigateTo(page) {
    window.location.href = `${page}.html`;
}

function quickSale() {
    navigateTo('ventas');
}

function viewAllAlerts() {
    // Navegar a página de alertas (si existe)
    alert('Funcionalidad en desarrollo - Navegará a gestión de alertas');
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    Dashboard.init();
});