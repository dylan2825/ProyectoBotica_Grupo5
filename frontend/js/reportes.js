// Reportes y Estadísticas
class ReportesManager {
    constructor() {
        this.reportData = {};
        this.init();
    }

    async init() {
        this.configurarFechasPorDefecto();
        this.configurarEventos();
        await this.generarReportes();
    }

    configurarFechasPorDefecto() {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);

        document.getElementById('fechaDesde').value = formatearFechaInput(hace30Dias);
        document.getElementById('fechaHasta').value = formatearFechaInput(hoy);
    }

    async generarReportes() {
        try {
            mostrarLoading(true);
            
            const fechaDesde = document.getElementById('fechaDesde').value;
            const fechaHasta = document.getElementById('fechaHasta').value;

            if (!fechaDesde || !fechaHasta) {
                mostrarError('Selecciona ambas fechas');
                return;
            }

            // Obtener datos del dashboard que ya incluyen métricas
            const response = await api.dashboard.obtenerMetricas();
            
            if (response.success) {
                this.reportData = response.data;
                this.actualizarMetricas();
                this.actualizarTablas();
            } else {
                mostrarError('Error al generar reportes: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al generar reportes');
        } finally {
            mostrarLoading(false);
        }
    }

    actualizarMetricas() {
        const data = this.reportData;

        // Métricas principales
        document.getElementById('ventasTotales').textContent = formatearMoneda(data.ventasHoy?.total || 0);
        document.getElementById('totalVentas').textContent = data.ventasHoy?.cantidad || 0;
        document.getElementById('productosVendidos').textContent = data.productosVendidosHoy || 0;
        document.getElementById('clientesAtendidos').textContent = data.clientesAtendidosHoy || 0;
    }

    actualizarTablas() {
        this.actualizarTopProductos();
        this.actualizarVentasDiarias();
    }

    actualizarTopProductos() {
        const container = document.getElementById('tablaTopProductos');
        const topProductos = this.reportData.topProductos || [];

        if (topProductos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay datos de productos vendidos</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table"><thead><tr><th>Producto</th><th>Vendidos</th><th>Total</th></tr></thead><tbody>';
        
        topProductos.forEach(producto => {
            html += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.vendidos}</td>
                    <td>${formatearMoneda(producto.total)}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    actualizarVentasDiarias() {
        const tbody = document.getElementById('ventasDiariasBody');
        const ventasDiarias = this.reportData.ventasUltimosDias || [];

        tbody.innerHTML = '';

        if (ventasDiarias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No hay datos de ventas diarias</td></tr>';
            return;
        }

        ventasDiarias.forEach(dia => {
            const promedio = dia.cantidad > 0 ? dia.total / dia.cantidad : 0;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFecha(dia.fecha)}</td>
                <td>${formatearMoneda(dia.total)}</td>
                <td>${dia.cantidad}</td>
                <td>${formatearMoneda(promedio)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    async exportarReporte() {
        try {
            mostrarLoading(true);
            
            const fechaDesde = document.getElementById('fechaDesde').value;
            const fechaHasta = document.getElementById('fechaHasta').value;

            const response = await api.reportes.exportarExcel(fechaDesde, fechaHasta);
            
            if (response.success && response.data.url) {
                // Descargar el archivo
                window.open(response.data.url, '_blank');
                mostrarExito('Reporte exportado correctamente');
            } else {
                mostrarError('Error al exportar reporte: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error al exportar el reporte');
        } finally {
            mostrarLoading(false);
        }
    }

    configurarEventos() {
        // Los eventos se configuran en el HTML con onclick
    }
}

// Funciones globales para HTML
function generarReportes() {
    reportesManager.generarReportes();
}

function exportarReporte() {
    reportesManager.exportarReporte();
}

// Inicialización
let reportesManager;

document.addEventListener('DOMContentLoaded', function() {
    reportesManager = new ReportesManager();
});