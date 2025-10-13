// Control de Inventario
class InventarioManager {
    constructor() {
        this.productos = [];
        this.init();
    }

    async init() {
        await this.cargarInventario();
        this.configurarEventos();
    }

    async cargarInventario() {
        try {
            mostrarLoading(true);
            const response = await api.productos.obtenerTodos();
            
            if (response.success) {
                this.productos = response.data;
                this.actualizarResumen();
                this.renderizarInventario();
            } else {
                mostrarError('Error al cargar inventario: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar inventario');
        } finally {
            mostrarLoading(false);
        }
    }

    actualizarResumen() {
        const totalProductos = this.productos.length;
        const stockBajo = this.productos.filter(p => p.stock <= (p.stock_minimo || 5) && p.stock > 0).length;
        const sinStock = this.productos.filter(p => p.stock <= 0).length;

        document.getElementById('totalProductos').textContent = totalProductos;
        document.getElementById('stockBajo').textContent = stockBajo;
        document.getElementById('sinStock').textContent = sinStock;
    }

    renderizarInventario() {
        const tbody = document.getElementById('inventarioBody');
        const filtroStock = document.getElementById('filtroStock').value;
        const busqueda = document.getElementById('buscarInventario').value.toLowerCase();

        tbody.innerHTML = '';

        let productosFiltrados = this.productos;

        // Aplicar filtro de stock
        if (filtroStock === 'stock-bajo') {
            productosFiltrados = productosFiltrados.filter(p => p.stock <= (p.stock_minimo || 5) && p.stock > 0);
        } else if (filtroStock === 'sin-stock') {
            productosFiltrados = productosFiltrados.filter(p => p.stock <= 0);
        }

        // Aplicar búsqueda
        if (busqueda) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) ||
                (p.categoria && p.categoria.toLowerCase().includes(busqueda))
            );
        }

        productosFiltrados.forEach(producto => {
            const tr = document.createElement('tr');
            const estado = this.obtenerEstadoStock(producto);
            
            tr.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.categoria || 'General'}</td>
                <td class="${estado.clase}">${producto.stock}</td>
                <td>${producto.stock_minimo || 5}</td>
                <td>
                    <span class="badge ${estado.badge}">${estado.texto}</span>
                </td>
                <td>${formatearFecha(producto.updated_at)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    obtenerEstadoStock(producto) {
        if (producto.stock <= 0) {
            return { texto: 'Sin Stock', clase: 'text-danger', badge: 'badge-danger' };
        } else if (producto.stock <= (producto.stock_minimo || 5)) {
            return { texto: 'Stock Bajo', clase: 'text-warning', badge: 'badge-warning' };
        } else {
            return { texto: 'En Stock', clase: 'text-success', badge: 'badge-success' };
        }
    }

    configurarEventos() {
        document.getElementById('filtroStock').addEventListener('change', () => {
            this.renderizarInventario();
        });

        document.getElementById('buscarInventario').addEventListener('input', () => {
            this.renderizarInventario();
        });
    }
}

// Inicialización
let inventarioManager;

document.addEventListener('DOMContentLoaded', function() {
    inventarioManager = new InventarioManager();
});