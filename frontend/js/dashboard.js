// Dashboard Manager - Versión Corregida y Consistente
class DashboardManager {
    constructor() {
        this.metricsData = null;
        this.init();
    }

    async init() {
        // Verificar autenticación usando la función de auth.js
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            // Obtener usuario del token o localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                document.getElementById('userName').textContent = user.nombre || 'Usuario';
                document.getElementById('welcomeName').textContent = user.nombre || 'Usuario';
                document.getElementById('userRole').textContent = user.rol ? `(${user.rol})` : '';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadDashboardData() {
        try {
            mostrarLoading(true);
            await Promise.all([
                this.loadMetrics(),
                this.loadAlerts(),
                this.loadTopProducts(),
                this.loadSalesSummary()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Error al cargar los datos del dashboard');
        } finally {
            mostrarLoading(false);
        }
    }

    async loadMetrics() {
        const container = document.getElementById('metricsGrid');
        if (!container) return;

        try {
            // Usar api.js para obtener métricas reales
            const response = await api.dashboard.obtenerMetricas();
            
            if (response.success) {
                const metricsData = response.data;
                
                const metricsHTML = `
                    <div class="metric-card">
                        <div class="metric-icon">💰</div>
                        <div class="metric-value">${metricsData.ventasHoy?.total || 0}</div>
                        <div class="metric-label">Ventas Hoy</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">📈</div>
                        <div class="metric-value">${formatearMoneda(metricsData.ventasHoy?.ingresos || 0)}</div>
                        <div class="metric-label">Ingresos</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">👥</div>
                        <div class="metric-value">${metricsData.clientesAtendidos || 0}</div>
                        <div class="metric-label">Clientes</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">🛍️</div>
                        <div class="metric-value">${metricsData.productosVendidos || 0}</div>
                        <div class="metric-label">Productos Vendidos</div>
                    </div>
                `;

                container.innerHTML = metricsHTML;
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error loading metrics:', error);
            
            // Datos de respaldo
            const metricsHTML = `
                <div class="metric-card">
                    <div class="metric-icon">💰</div>
                    <div class="metric-value">0</div>
                    <div class="metric-label">Ventas Hoy</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📈</div>
                    <div class="metric-value">${formatearMoneda(0)}</div>
                    <div class="metric-label">Ingresos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">👥</div>
                    <div class="metric-value">0</div>
                    <div class="metric-label">Clientes</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">🛍️</div>
                    <div class="metric-value">0</div>
                    <div class="metric-label">Productos Vendidos</div>
                </div>
            `;
            
            container.innerHTML = metricsHTML;
            mostrarError('Error cargando métricas: ' + error.message);
        }
    }

    async loadAlerts() {
        const container = document.getElementById('alertasList');
        if (!container) return;

        try {
            // Obtener alertas reales del inventario
            const response = await api.productos.obtenerStockBajo();
            
            let alertsData = [];
            if (response.success && response.data) {
                alertsData = response.data.map(producto => ({
                    type: 'stock_bajo',
                    message: `${producto.nombre} - Stock bajo (${producto.stock} unidades)`,
                    product: producto.nombre,
                    stock: producto.stock,
                    priority: producto.stock <= 3 ? 'high' : 'medium'
                }));
            }

            if (alertsData.length === 0) {
                container.innerHTML = '<div class="empty-alerts">No hay alertas urgentes</div>';
                return;
            }

            const alertsHTML = alertsData.map(alert => `
                <div class="alerta-item ${alert.priority}">
                    <div class="alerta-icon">
                        ${alert.priority === 'high' ? '🚨' : '⚠️'}
                    </div>
                    <div class="alerta-content">
                        <div class="alerta-message">${alert.message}</div>
                        <div class="alerta-product">${alert.product}</div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = alertsHTML;

        } catch (error) {
            console.error('Error loading alerts:', error);
            container.innerHTML = '<div class="empty-alerts">No se pudieron cargar las alertas</div>';
        }
    }

    async loadTopProducts() {
        const container = document.getElementById('topProductsList');
        if (!container) return;

        try {
            // Obtener productos más vendidos
            const response = await api.dashboard.obtenerTopProductos();
            
            let topProducts = [];
            if (response.success && response.data) {
                topProducts = response.data;
            } else {
                // Datos de respaldo
                topProducts = [
                    { nombre: 'Paracetamol 500mg', vendidos: 45, ranking: 1 },
                    { nombre: 'Amoxicilina 500mg', vendidos: 32, ranking: 2 },
                    { nombre: 'Ibuprofeno 400mg', vendidos: 28, ranking: 3 },
                    { nombre: 'Omeprazol 20mg', vendidos: 24, ranking: 4 },
                    { nombre: 'Loratadina 10mg', vendidos: 19, ranking: 5 }
                ];
            }

            const productsHTML = topProducts.map(product => `
                <div class="product-item">
                    <div class="product-rank">#${product.ranking || 1}</div>
                    <div class="product-info">
                        <div class="product-name">${product.nombre}</div>
                        <div class="product-sales">${product.vendidos || 0} unidades vendidas</div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = productsHTML;

        } catch (error) {
            console.error('Error loading top products:', error);
            container.innerHTML = '<div class="error-state">Error cargando productos</div>';
        }
    }

    async loadSalesSummary() {
        try {
            // Obtener resumen de ventas del día
            const response = await api.dashboard.obtenerResumenVentas();
            
            let salesData = {
                todaySales: 0,
                todayRevenue: 0,
                avgTicket: 0
            };

            if (response.success && response.data) {
                salesData = response.data;
            }

            document.getElementById('todaySales').textContent = salesData.todaySales || 0;
            document.getElementById('todayRevenue').textContent = formatearMoneda(salesData.todayRevenue || 0);
            
            const avg = salesData.todaySales > 0 ? (salesData.todayRevenue / salesData.todaySales) : 0;
            document.getElementById('avgTicket').textContent = formatearMoneda(avg);

        } catch (error) {
            console.error('Error loading sales summary:', error);
            
            // Valores por defecto
            document.getElementById('todaySales').textContent = '0';
            document.getElementById('todayRevenue').textContent = formatearMoneda(0);
            document.getElementById('avgTicket').textContent = formatearMoneda(0);
        }
    }

    setupEventListeners() {
        // Buscador global
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Actualizar datos cada 2 minutos
        setInterval(() => {
            this.loadDashboardData();
        }, 120000);
    }

    handleSearch(e) {
        const term = e.target.value.toLowerCase();
        // Implementar búsqueda en tiempo real si es necesario
        console.log('Buscando:', term);
    }

    showError(message) {
        mostrarError(message);
    }
}

// Funciones globales para el HTML
function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function viewAllAlerts() {
    window.location.href = 'inventario.html';
}

function quickSale() {
    window.location.href = 'ventas.html';
}

function navigateTo(page) {
    window.location.href = `${page}.html`;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que las dependencias estén cargadas
    if (typeof api === 'undefined') {
        console.error('api.js no está cargado');
        return;
    }
    
    if (typeof mostrarLoading === 'undefined') {
        console.error('utils.js no está cargado');
        return;
    }

    window.dashboardManager = new DashboardManager();
});