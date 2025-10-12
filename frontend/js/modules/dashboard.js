class Dashboard {
    constructor() {
        this.metricas = null;
        this.alertas = [];
    }

    async render() {
        return `
            <div class="dashboard">
                <div class="page-header">
                    <h1>Dashboard</h1>
                    <p>Resumen general del negocio</p>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card card">
                        <div class="metric-icon">💰</div>
                        <div class="metric-info">
                            <h3>Ventas del Día</h3>
                            <div class="metric-value" id="ventas-hoy">0</div>
                            <div class="metric-change" id="cambio-ventas">--</div>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="metric-icon">📦</div>
                        <div class="metric-info">
                            <h3>Stock Bajo</h3>
                            <div class="metric-value" id="stock-bajo">0</div>
                            <div class="metric-change">Requieren atención</div>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="metric-icon">👥</div>
                        <div class="metric-info">
                            <h3>Clientes Nuevos</h3>
                            <div class="metric-value" id="clientes-nuevos">0</div>
                            <div class="metric-change" id="cambio-clientes">--</div>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="metric-icon">📈</div>
                        <div class="metric-info">
                            <h3>Ingresos del Mes</h3>
                            <div class="metric-value" id="ingresos-mes">S/ 0.00</div>
                            <div class="metric-change" id="cambio-ingresos">--</div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-content">
                    <div class="alertas-section card">
                        <div class="card-header">
                            <h3 class="card-title">Alertas Recientes</h3>
                            <button class="btn btn-outline btn-sm" onclick="dashboard.marcarTodasLeidas()">
                                Marcar todas como leídas
                            </button>
                        </div>
                        <div class="alertas-list" id="alertas-list">
                            <div class="empty-state">
                                <div class="empty-icon">🔔</div>
                                <p>Cargando alertas...</p>
                            </div>
                        </div>
                    </div>

                    <div class="top-products-section card">
                        <div class="card-header">
                            <h3 class="card-title">Productos Más Vendidos</h3>
                        </div>
                        <div class="top-products-list" id="top-products">
                            <div class="empty-state">
                                <div class="empty-icon">📦</div>
                                <p>Cargando productos...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeEvents() {
        await this.cargarMetricas();
        await this.cargarAlertas();
        await this.cargarTopProductos();
    }

    async cargarMetricas() {
        try {
            const result = await api.getMetricas();
            if (result.success) {
                this.metricas = result.data;
                this.actualizarUI();
            }
        } catch (error) {
            console.error('Error cargando métricas:', error);
            this.mostrarDatosDemo();
        }
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

    async cargarTopProductos() {
        try {
            const result = await api.getProductos({ limit: 5 });
            if (result.success) {
                this.renderTopProductos(result.data);
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.renderTopProductosDemo();
        }
    }

    actualizarUI() {
        if (!this.metricas) return;

        const metricas = this.metricas;
        document.getElementById('ventas-hoy').textContent = metricas.ventasHoy || '0';
        document.getElementById('stock-bajo').textContent = metricas.stockBajo || '0';
        document.getElementById('clientes-nuevos').textContent = metricas.clientesNuevos || '0';
        document.getElementById('ingresos-mes').textContent = `S/ ${(metricas.ingresosMes || 0).toFixed(2)}`;
    }

    mostrarDatosDemo() {
        // Datos de demostración si la API falla
        document.getElementById('ventas-hoy').textContent = '12';
        document.getElementById('stock-bajo').textContent = '3';
        document.getElementById('clientes-nuevos').textContent = '5';
        document.getElementById('ingresos-mes').textContent = 'S/ 1,250.00';
    }

    renderAlertas() {
        const container = document.getElementById('alertas-list');
        
        if (!this.alertas || this.alertas.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay alertas pendientes</div>';
            return;
        }

        container.innerHTML = this.alertas.map(alerta => `
            <div class="alerta-item ${alerta.prioridad} ${alerta.leida ? 'leida' : ''}">
                <div class="alerta-icon">${this.getAlertaIcon(alerta.prioridad)}</div>
                <div class="alerta-content">
                    <div class="alerta-title">${alerta.titulo}</div>
                    <div class="alerta-desc">${alerta.descripcion}</div>
                </div>
                ${!alerta.leida ? `
                    <button class="btn btn-outline btn-sm" 
                            onclick="dashboard.marcarAlertaLeida('${alerta.id}')">
                        Marcar leída
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    renderAlertasDemo() {
        const container = document.getElementById('alertas-list');
        container.innerHTML = `
            <div class="alerta-item media">
                <div class="alerta-icon">🟡</div>
                <div class="alerta-content">
                    <div class="alerta-title">Stock bajo en Paracetamol</div>
                    <div class="alerta-desc">Quedan 15 unidades</div>
                </div>
            </div>
            <div class="alerta-item baja">
                <div class="alerta-icon">🔵</div>
                <div class="alerta-content">
                    <div class="alerta-title">Revisión de inventario</div>
                    <div class="alerta-desc">Programada para fin de mes</div>
                </div>
            </div>
        `;
    }

    renderTopProductos(productos) {
        const container = document.getElementById('top-products');
        
        if (!productos || productos.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay productos</div>';
            return;
        }

        container.innerHTML = productos.slice(0, 5).map((producto, index) => `
            <div class="top-product-item">
                <div class="product-rank">${index + 1}</div>
                <div class="product-info">
                    <div class="product-name">${producto.nombre}</div>
                    <div class="product-price">S/ ${producto.precio_venta}</div>
                </div>
            </div>
        `).join('');
    }

    renderTopProductosDemo() {
        const container = document.getElementById('top-products');
        const productosDemo = [
            { nombre: 'Paracetamol 500mg', precio_venta: 5.00 },
            { nombre: 'Ibuprofeno 400mg', precio_venta: 6.50 },
            { nombre: 'Amoxicilina 500mg', precio_venta: 15.00 },
            { nombre: 'Omeprazol 20mg', precio_venta: 9.00 },
            { nombre: 'Loratadina 10mg', precio_venta: 7.00 }
        ];
        
        this.renderTopProductos(productosDemo);
    }

    getAlertaIcon(prioridad) {
        const icons = { alta: '🔴', media: '🟡', baja: '🔵' };
        return icons[prioridad] || '⚪';
    }

    async marcarAlertaLeida(id) {
        try {
            await api.marcarAlertaLeida(id);
            notificaciones.mostrar('Alerta marcada como leída', 'success');
            await this.cargarAlertas();
        } catch (error) {
            notificaciones.mostrar('Error al marcar alerta', 'error');
        }
    }

    async marcarTodasLeidas() {
        try {
            for (const alerta of this.alertas.filter(a => !a.leida)) {
                await api.marcarAlertaLeida(alerta.id);
            }
            notificaciones.mostrar('Todas las alertas marcadas como leídas', 'success');
            await this.cargarAlertas();
        } catch (error) {
            notificaciones.mostrar('Error al marcar alertas', 'error');
        }
    }
}

const dashboard = new Dashboard();