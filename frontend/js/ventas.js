// Punto de Venta functionality
class VentasManager {
    static cart = [];
    static currentCustomer = null;
    static saleCode = '';

    static async init() {
        if (!AuthManager.requireAuth()) return;

        this.generateSaleCode();
        this.loadUserInfo();
        await this.loadProducts();
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    static generateSaleCode() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        this.saleCode = `V${timestamp}${random}`;
        document.getElementById('currentSale').textContent = `Venta ${this.saleCode}`;
        
        const now = new Date();
        document.getElementById('saleTime').textContent = now.toLocaleString();
    }

    static loadUserInfo() {
        const user = AuthManager.getUser();
        if (user) {
            document.getElementById('userName').textContent = user.nombre;
        }
    }

    static async loadProducts() {
        try {
            const data = await API.getProductos();
            
            if (data.success) {
                this.displayProducts(data.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Error al cargar los productos');
        }
    }

    static displayProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        const productsCount = document.getElementById('productsCount');
        
        productsCount.textContent = `${products.length} productos`;
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛍️</div>
                    <p>No hay productos disponibles</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card ${product.stock_actual === 0 ? 'out-of-stock' : ''}" 
                 onclick="VentasManager.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="product-image">
                    💊
                </div>
                <div class="product-info">
                    <h4>${product.nombre}</h4>
                    <div class="product-meta">
                        <span class="product-price">S/ ${product.precio_venta}</span>
                        <span class="product-stock ${this.getStockClass(product.stock_actual, product.stock_minimo)}">
                            Stock: ${product.stock_actual}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static getStockClass(stock, minStock) {
        if (stock === 0) return 'out';
        if (stock <= minStock) return 'low';
        return '';
    }

    static setupEventListeners() {
        // Búsqueda en tiempo real
        const searchInput = document.getElementById('productSearch');
        searchInput.addEventListener('input', this.handleSearch.bind(this));

        // Descuento
        const descuentoInput = document.getElementById('descuento');
        descuentoInput.addEventListener('input', this.updateTotals.bind(this));

        // Búsqueda de clientes
        const customerSearch = document.getElementById('customerSearch');
        customerSearch.addEventListener('input', this.handleCustomerSearch.bind(this));

        // Cerrar modal al hacer click fuera
        document.getElementById('customerModal').addEventListener('click', (e) => {
            if (e.target.id === 'customerModal') {
                this.closeCustomerModal();
            }
        });
    }

    static async handleSearch(e) {
        const query = e.target.value.trim();
        const resultsContainer = document.getElementById('searchResults');
        
        if (query.length < 2) {
            resultsContainer.classList.remove('show');
            return;
        }

        try {
            const data = await API.getProductos(query);
            
            if (data.success && data.data.length > 0) {
                resultsContainer.innerHTML = data.data.map(product => `
                    <div class="search-result-item" 
                         onclick="VentasManager.addToCartFromSearch(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <div class="product-name">${product.nombre}</div>
                        <div class="product-details">
                            <span class="product-stock">Stock: ${product.stock_actual}</span>
                            <span class="product-price">S/ ${product.precio_venta}</span>
                        </div>
                    </div>
                `).join('');
                resultsContainer.classList.add('show');
            } else {
                resultsContainer.innerHTML = '<div class="search-result-item">No se encontraron productos</div>';
                resultsContainer.classList.add('show');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    static addToCartFromSearch(product) {
        this.addToCart(product);
        document.getElementById('productSearch').value = '';
        document.getElementById('searchResults').classList.remove('show');
    }

    static addToCart(product) {
        if (product.stock_actual === 0) {
            this.showError('Producto sin stock disponible');
            return;
        }

        const existingItem = this.cart.find(item => item.producto.id === product.id);
        
        if (existingItem) {
            if (existingItem.cantidad >= product.stock_actual) {
                this.showError('No hay suficiente stock disponible');
                return;
            }
            existingItem.cantidad += 1;
        } else {
            this.cart.push({
                producto: product,
                cantidad: 1,
                precio_unitario: product.precio_venta
            });
        }

        this.updateCartDisplay();
        this.showSuccess('Producto agregado al carrito');
    }

    static updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const processBtn = document.getElementById('processSaleBtn');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">🛒</div>
                    <p>El carrito está vacío</p>
                    <small>Agrega productos para comenzar la venta</small>
                </div>
            `;
            processBtn.disabled = true;
        } else {
            cartItems.innerHTML = this.cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-image">💊</div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.producto.nombre}</div>
                        <div class="cart-item-price">S/ ${item.precio_unitario} c/u</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="VentasManager.updateQuantity(${index}, -1)">-</button>
                        <input type="number" class="quantity-input" 
                               value="${item.cantidad}" min="1" max="${item.producto.stock_actual}"
                               onchange="VentasManager.setQuantity(${index}, this.value)">
                        <button class="quantity-btn" onclick="VentasManager.updateQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        S/ ${(item.cantidad * item.precio_unitario).toFixed(2)}
                    </div>
                    <button class="remove-item" onclick="VentasManager.removeFromCart(${index})">
                        🗑️
                    </button>
                </div>
            `).join('');
            processBtn.disabled = false;
        }

        this.updateTotals();
    }

    static updateQuantity(index, change) {
        const item = this.cart[index];
        const newQuantity = item.cantidad + change;
        
        if (newQuantity < 1) {
            this.removeFromCart(index);
            return;
        }
        
        if (newQuantity > item.producto.stock_actual) {
            this.showError('No hay suficiente stock disponible');
            return;
        }
        
        item.cantidad = newQuantity;
        this.updateCartDisplay();
    }

    static setQuantity(index, value) {
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) return;
        
        this.updateQuantity(index, quantity - this.cart[index].cantidad);
    }

    static removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
    }

    static updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => 
            sum + (item.cantidad * item.precio_unitario), 0);
        
        const descuento = parseFloat(document.getElementById('descuento').value) || 0;
        const total = Math.max(0, subtotal - descuento);
        
        document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;
    }

    static clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
            this.cart = [];
            this.currentCustomer = null;
            this.updateCartDisplay();
            this.updateCustomerDisplay();
            this.showSuccess('Carrito limpiado');
        }
    }

    static async processSale() {
        if (this.cart.length === 0) {
            this.showError('El carrito está vacío');
            return;
        }

        const ventaData = {
            productos: this.cart.map(item => ({
                producto_id: item.producto.id,
                cantidad: item.cantidad
            })),
            cliente_id: this.currentCustomer?.id || null,
            descuento: parseFloat(document.getElementById('descuento').value) || 0
        };

        try {
            const data = await API.procesarVenta(ventaData);
            
            if (data.success) {
                this.showSuccess(`Venta procesada exitosamente - Total: S/ ${data.venta.total_final}`);
                this.clearCart();
                this.generateSaleCode();
            } else {
                throw new Error(data.error || 'Error al procesar la venta');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Customer management
    static showCustomerModal() {
        document.getElementById('customerModal').classList.add('show');
        this.handleCustomerSearch({ target: { value: '' } });
    }

    static closeCustomerModal() {
        document.getElementById('customerModal').classList.remove('show');
    }

    static async handleCustomerSearch(e) {
        const query = e.target.value.trim();
        const customersList = document.getElementById('customersList');
        
        if (query.length < 2) {
            customersList.innerHTML = '<div class="loading-state"><p>Ingresa al menos 2 caracteres</p></div>';
            return;
        }

        try {
            const data = await API.getClientes(query);
            
            if (data.success && data.data.length > 0) {
                customersList.innerHTML = data.data.map(cliente => `
                    <div class="customer-item" onclick="VentasManager.selectCustomer(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">
                        <div class="customer-item-name">
                            ${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ''}
                        </div>
                        <div class="customer-item-details">
                            ${cliente.tipo_documento.toUpperCase()}: ${cliente.numero_documento}
                        </div>
                    </div>
                `).join('');
            } else {
                customersList.innerHTML = '<div class="loading-state"><p>No se encontraron clientes</p></div>';
            }
        } catch (error) {
            console.error('Customer search error:', error);
        }
    }

    static selectCustomer(cliente) {
        this.currentCustomer = cliente;
        this.updateCustomerDisplay();
        this.closeCustomerModal();
        this.showSuccess('Cliente seleccionado');
    }

    static updateCustomerDisplay() {
        const customerInfo = document.getElementById('customerInfo');
        
        if (this.currentCustomer) {
            customerInfo.innerHTML = `
                <div class="customer-selected">
                    <div class="customer-name">
                        ${this.currentCustomer.nombres} ${this.currentCustomer.apellido_paterno} ${this.currentCustomer.apellido_materno || ''}
                    </div>
                    <div class="customer-details">
                        ${this.currentCustomer.tipo_documento.toUpperCase()}: ${this.currentCustomer.numero_documento}
                        ${this.currentCustomer.telefono ? ` • Tel: ${this.currentCustomer.telefono}` : ''}
                    </div>
                </div>
            `;
        } else {
            customerInfo.innerHTML = `
                <div class="no-customer">
                    <span>Cliente no seleccionado</span>
                    <small>Venta anónima</small>
                </div>
            `;
        }
    }

    // Utility methods
    static showError(message) {
        alert(`❌ ${message}`);
    }

    static showSuccess(message) {
        // En una versión mejorada podríamos usar toasts
        console.log(`✅ ${message}`);
    }
}

// Funciones globales
function logout() {
    AuthManager.logout();
}

function clearCart() {
    VentasManager.clearCart();
}

function processSale() {
    VentasManager.processSale();
}

function showCustomerModal() {
    VentasManager.showCustomerModal();
}

function closeCustomerModal() {
    VentasManager.closeCustomerModal();
}

function quickActions() {
    alert('Acciones rápidas en desarrollo');
}

function printReceipt() {
    alert('Impresión de ticket en desarrollo');
}

// Inicializar punto de venta
document.addEventListener('DOMContentLoaded', function() {
    VentasManager.init();
});