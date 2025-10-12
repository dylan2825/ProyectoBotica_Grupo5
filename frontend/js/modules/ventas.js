class Ventas {
    constructor() {
        this.carrito = [];
    }

    async render() {
        return `
            <div class="ventas-module">
                <div class="page-header">
                    <h1>Punto de Venta</h1>
                    <p>Procesa ventas de manera rápida y eficiente</p>
                </div>

                <div class="ventas-layout">
                    <div class="ventas-left">
                        <div class="search-section card">
                            <div class="form-group">
                                <label class="form-label">Buscar Producto</label>
                                <input type="text" class="form-control" id="buscar-producto" placeholder="Escribe nombre del producto...">
                            </div>
                        </div>

                        <div class="products-grid card">
                            <h3>Productos Disponibles</h3>
                            <div class="products-list" id="products-list">
                                <div class="empty-state">Cargando productos...</div>
                            </div>
                        </div>
                    </div>

                    <div class="ventas-right">
                        <div class="cart-section card">
                            <div class="card-header">
                                <h3 class="card-title">Carrito de Venta</h3>
                                <span class="items-count">0 items</span>
                            </div>
                            <div class="cart-items" id="cart-items">
                                <div class="empty-cart">El carrito está vacío</div>
                            </div>
                            <div class="cart-summary">
                                <div class="summary-row">
                                    <span>Subtotal:</span>
                                    <span id="subtotal">S/ 0.00</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total:</span>
                                    <span id="total">S/ 0.00</span>
                                </div>
                            </div>
                            <div class="cart-actions">
                                <button class="btn btn-danger" onclick="ventas.vaciarCarrito()">Vaciar Carrito</button>
                                <button class="btn btn-success" onclick="ventas.procesarVenta()" disabled>Procesar Venta</button>
                            </div>
                        </div>
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
                this.renderProductos();
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.renderProductosDemo();
        }
    }

    renderProductos() {
        const container = document.getElementById('products-list');
        
        if (!this.productos || this.productos.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay productos disponibles</div>';
            return;
        }

        container.innerHTML = this.productos.map(producto => `
            <div class="product-item" onclick="ventas.agregarAlCarrito('${producto.id}')">
                <div class="product-info">
                    <div class="product-name">${producto.nombre}</div>
                    <div class="product-price">S/ ${producto.precio_venta}</div>
                    <div class="product-stock">Stock: ${producto.stock}</div>
                </div>
                <button class="btn btn-primary btn-sm">Agregar</button>
            </div>
        `).join('');
    }

    renderProductosDemo() {
        const container = document.getElementById('products-list');
        container.innerHTML = `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">Paracetamol 500mg</div>
                    <div class="product-price">S/ 5.00</div>
                    <div class="product-stock">Stock: 100</div>
                </div>
                <button class="btn btn-primary btn-sm">Agregar</button>
            </div>
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">Ibuprofeno 400mg</div>
                    <div class="product-price">S/ 6.50</div>
                    <div class="product-stock">Stock: 80</div>
                </div>
                <button class="btn btn-primary btn-sm">Agregar</button>
            </div>
        `;
    }

    agregarAlCarrito(productoId) {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }

    vaciarCarrito() {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }

    procesarVenta() {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }
}

const ventas = new Ventas();