class Inventario {
    constructor() {
        this.productos = [];
    }

    async render() {
        return `
            <div class="inventario-module">
                <div class="page-header">
                    <h1>Gestión de Inventario</h1>
                    <p>Administra productos y controla el stock</p>
                </div>

                <div class="inventario-actions card">
                    <div class="card-header">
                        <h3 class="card-title">Productos</h3>
                        <button class="btn btn-primary" onclick="inventario.mostrarModalProducto()">
                            + Nuevo Producto
                        </button>
                    </div>
                </div>

                <div class="inventario-table card">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Precio Venta</th>
                                    <th>Stock</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-productos">
                                <tr>
                                    <td colspan="5" class="text-center">Cargando productos...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeEvents() {
        await this.cargarProductos();
    }

    async cargarProductos() {
        try {
            const result = await api.getProductos();
            if (result.success) {
                this.productos = result.data;
                this.renderTablaProductos();
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.renderTablaProductosDemo();
        }
    }

    renderTablaProductos() {
        const tbody = document.getElementById('tabla-productos');
        
        if (!this.productos || this.productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron productos</td></tr>';
            return;
        }

        tbody.innerHTML = this.productos.map(producto => `
            <tr>
                <td>
                    <div class="producto-info">
                        <div class="producto-nombre">${producto.nombre}</div>
                        ${producto.descripcion ? `<div class="producto-desc">${producto.descripcion}</div>` : ''}
                    </div>
                </td>
                <td>S/ ${producto.precio_venta}</td>
                <td>
                    <span class="stock-value ${producto.stock <= (producto.stock_minimo || 10) ? 'text-danger' : ''}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${producto.stock > 0 ? 'status-active' : 'status-inactive'}">
                        ${producto.stock > 0 ? 'Disponible' : 'Agotado'}
                    </span>
                </td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-outline btn-sm" onclick="inventario.editarProducto('${producto.id}')">
                            Editar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderTablaProductosDemo() {
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = `
            <tr>
                <td>
                    <div class="producto-info">
                        <div class="producto-nombre">Paracetamol 500mg</div>
                        <div class="producto-desc">Analgésico y antipirético</div>
                    </div>
                </td>
                <td>S/ 5.00</td>
                <td><span class="stock-value">100</span></td>
                <td><span class="status-badge status-active">Disponible</span></td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-outline btn-sm">Editar</button>
                    </div>
                </td>
            </tr>
        `;
    }

    mostrarModalProducto() {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }

    editarProducto(productoId) {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }
}

const inventario = new Inventario();