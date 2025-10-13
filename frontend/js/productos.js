// Gestión de Productos functionality
class ProductosManager {
    static products = [];
    static categories = [];
    static currentProduct = null;
    static currentPage = 1;
    static itemsPerPage = 10;
    static filters = {
        search: '',
        category: '',
        stock: '',
        status: ''
    };

    static async init() {
        if (!AuthManager.requireAuth()) return;

        this.loadUserInfo();
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
        this.updateStats();
    }

    static loadUserInfo() {
        const user = AuthManager.getUser();
        if (user) {
            document.getElementById('userName').textContent = user.nombre;
        }
    }

    static async loadCategories() {
        try {
            // En una implementación real, esto vendría de una API de categorías
            this.categories = [
                { id: 1, nombre: 'Analgésicos y Antiinflamatorios' },
                { id: 2, nombre: 'Antibióticos' },
                { id: 3, nombre: 'Cuidado Personal' },
                { id: 4, nombre: 'Vitaminas y Suplementos' },
                { id: 5, nombre: 'Cuidado Infantil' },
                { id: 6, nombre: 'Primeros Auxilios' },
                { id: 7, nombre: 'Cuidado de la Piel' },
                { id: 8, nombre: 'Medicamentos Crónicos' }
            ];

            const categorySelect = document.getElementById('categoryFilter');
            const productCategory = document.getElementById('productCategory');
            
            this.categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.id}">${category.nombre}</option>`;
                productCategory.innerHTML += `<option value="${category.id}">${category.nombre}</option>`;
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    static async loadProducts() {
        try {
            const data = await API.getProductos();
            
            if (data.success) {
                this.products = data.data;
                this.applyFilters();
                this.renderProducts();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Error al cargar los productos');
        }
    }

    static applyFilters() {
        let filtered = [...this.products];

        // Filtro de búsqueda
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.nombre.toLowerCase().includes(searchTerm) ||
                (product.codigo && product.codigo.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro de categoría
        if (this.filters.category) {
            filtered = filtered.filter(product => 
                product.categoria_id == this.filters.category
            );
        }

        // Filtro de stock
        if (this.filters.stock) {
            switch (this.filters.stock) {
                case 'low':
                    filtered = filtered.filter(product => 
                        product.stock_actual <= product.stock_minimo && product.stock_actual > 0
                    );
                    break;
                case 'out':
                    filtered = filtered.filter(product => product.stock_actual === 0);
                    break;
                case 'normal':
                    filtered = filtered.filter(product => product.stock_actual > product.stock_minimo);
                    break;
            }
        }

        // Filtro de estado
        if (this.filters.status) {
            filtered = filtered.filter(product => 
                (this.filters.status === 'active' && product.activo) ||
                (this.filters.status === 'inactive' && !product.activo)
            );
        }

        return filtered;
    }

    static renderProducts() {
        const filteredProducts = this.applyFilters();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        const tableBody = document.getElementById('productsTableBody');
        const showingCount = document.getElementById('showingCount');
        const totalCount = document.getElementById('totalCount');
        const currentPage = document.getElementById('currentPage');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');

        // Actualizar información de paginación
        showingCount.textContent = paginatedProducts.length;
        totalCount.textContent = filteredProducts.length;
        currentPage.textContent = this.currentPage;
        
        prevPage.disabled = this.currentPage === 1;
        nextPage.disabled = endIndex >= filteredProducts.length;

        if (paginatedProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-icon">🛍️</div>
                        <p>No se encontraron productos</p>
                        <small>Intenta con otros filtros o crea un nuevo producto</small>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = paginatedProducts.map(product => `
            <tr>
                <td><strong>${product.codigo || 'N/A'}</strong></td>
                <td>
                    <div class="product-info">
                        <div class="product-name">${product.nombre}</div>
                        ${product.descripcion ? `<small class="product-description">${product.descripcion}</small>` : ''}
                    </div>
                </td>
                <td>${this.getCategoryName(product.categoria_id)}</td>
                <td>S/ ${product.precio_compra}</td>
                <td><strong>S/ ${product.precio_venta}</strong></td>
                <td>
                    <span class="${this.getStockClass(product.stock_actual, product.stock_minimo)}">
                        ${product.stock_actual}
                        ${product.stock_actual <= product.stock_minimo ? '⚠️' : ''}
                    </span>
                    <small class="stock-min">Mín: ${product.stock_minimo}</small>
                </td>
                <td>
                    <span class="status-badge ${product.activo ? 'status-active' : 'status-inactive'}">
                        ${product.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon-sm" onclick="ProductosManager.editProduct(${product.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon-sm" onclick="ProductosManager.adjustStock(${product.id})" title="Ajustar Stock">
                            📦
                        </button>
                        <button class="btn-icon-sm" onclick="ProductosManager.toggleProductStatus(${product.id})" 
                                title="${product.activo ? 'Desactivar' : 'Activar'}">
                            ${product.activo ? '⏸️' : '▶️'}
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    static getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id == categoryId);
        return category ? category.nombre : 'Sin categoría';
    }

    static getStockClass(stock, minStock) {
        if (stock === 0) return 'stock-out';
        if (stock <= minStock) return 'stock-low';
        return 'stock-normal';
    }

    static setupEventListeners() {
        // Búsqueda en tiempo real
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.currentPage = 1;
            this.renderProducts();
        });

        // Filtros
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.currentPage = 1;
            this.renderProducts();
        });

        document.getElementById('stockFilter').addEventListener('change', (e) => {
            this.filters.stock = e.target.value;
            this.currentPage = 1;
            this.renderProducts();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.currentPage = 1;
            this.renderProducts();
        });

        // Paginación
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderProducts();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.currentPage++;
            this.renderProducts();
        });

        // Formulario de producto
        document.getElementById('productForm').addEventListener('submit', this.handleProductSubmit.bind(this));
        
        // Formulario de stock
        document.getElementById('stockForm').addEventListener('submit', this.handleStockSubmit.bind(this));

        // Cerrar modales al hacer click fuera
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target.id === 'productModal') this.closeProductModal();
        });

        document.getElementById('stockModal').addEventListener('click', (e) => {
            if (e.target.id === 'stockModal') this.closeStockModal();
        });
    }

    static updateStats() {
        const total = this.products.length;
        const lowStock = this.products.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length;
        const outOfStock = this.products.filter(p => p.stock_actual === 0).length;
        const active = this.products.filter(p => p.activo).length;

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('lowStockProducts').textContent = lowStock;
        document.getElementById('outOfStockProducts').textContent = outOfStock;
        document.getElementById('activeProducts').textContent = active;
    }

    // Modal de producto
    static showProductModal(product = null) {
        this.currentProduct = product;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Editar Producto';
            this.fillProductForm(product);
        } else {
            title.textContent = 'Nuevo Producto';
            form.reset();
        }

        modal.classList.add('show');
    }

    static closeProductModal() {
        document.getElementById('productModal').classList.remove('show');
        this.currentProduct = null;
    }

    static fillProductForm(product) {
        document.getElementById('productCode').value = product.codigo || '';
        document.getElementById('productName').value = product.nombre || '';
        document.getElementById('productDescription').value = product.descripcion || '';
        document.getElementById('productCategory').value = product.categoria_id || '';
        document.getElementById('productSupplier').value = product.proveedor || '';
        document.getElementById('purchasePrice').value = product.precio_compra || '';
        document.getElementById('salePrice').value = product.precio_venta || '';
        document.getElementById('currentStock').value = product.stock_actual || '';
        document.getElementById('minStock').value = product.stock_minimo || '';
        document.getElementById('productActive').checked = product.activo !== false;
    }

    static async handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = {
            codigo: document.getElementById('productCode').value,
            nombre: document.getElementById('productName').value,
            descripcion: document.getElementById('productDescription').value,
            categoria_id: document.getElementById('productCategory').value,
            proveedor: document.getElementById('productSupplier').value,
            precio_compra: parseFloat(document.getElementById('purchasePrice').value),
            precio_venta: parseFloat(document.getElementById('salePrice').value),
            stock_actual: parseInt(document.getElementById('currentStock').value),
            stock_minimo: parseInt(document.getElementById('minStock').value),
            activo: document.getElementById('productActive').checked
        };

        try {
            // En una implementación real, aquí haríamos la llamada a la API
            if (this.currentProduct) {
                // Actualizar producto existente
                this.showSuccess('Producto actualizado exitosamente');
            } else {
                // Crear nuevo producto
                this.showSuccess('Producto creado exitosamente');
            }
            
            this.closeProductModal();
            await this.loadProducts(); // Recargar la lista
        } catch (error) {
            this.showError('Error al guardar el producto: ' + error.message);
        }
    }

    // Modal de stock
    static adjustStock(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentProduct = product;
        const modal = document.getElementById('stockModal');
        
        document.getElementById('stockProductName').value = product.nombre;
        document.getElementById('stockQuantity').value = '';
        document.getElementById('stockReason').value = '';
        document.getElementById('stockAction').value = 'entrada';

        modal.classList.add('show');
    }

    static closeStockModal() {
        document.getElementById('stockModal').classList.remove('show');
        this.currentProduct = null;
    }

    static async handleStockSubmit(e) {
        e.preventDefault();
        
        const movimiento = {
            producto_id: this.currentProduct.id,
            tipo_movimiento: document.getElementById('stockAction').value,
            cantidad: parseInt(document.getElementById('stockQuantity').value),
            motivo: document.getElementById('stockReason').value
        };

        try {
            // En una implementación real, llamaríamos a la API para actualizar stock
            this.showSuccess('Stock actualizado exitosamente');
            this.closeStockModal();
            await this.loadProducts(); // Recargar la lista
        } catch (error) {
            this.showError('Error al actualizar el stock: ' + error.message);
        }
    }

    // Otras acciones
    static editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.showProductModal(product);
        }
    }

    static async toggleProductStatus(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const newStatus = !product.activo;
        const confirmMessage = `¿Estás seguro de que quieres ${newStatus ? 'activar' : 'desactivar'} este producto?`;

        if (!confirm(confirmMessage)) return;

        try {
            // En una implementación real, llamaríamos a la API
            this.showSuccess(`Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
            await this.loadProducts(); // Recargar la lista
        } catch (error) {
            this.showError('Error al cambiar el estado del producto');
        }
    }

    // Utilidades
    static refreshProducts() {
        this.loadProducts();
        this.showSuccess('Lista de productos actualizada');
    }

    static clearSearch() {
        document.getElementById('searchInput').value = '';
        this.filters.search = '';
        this.currentPage = 1;
        this.renderProducts();
    }

    static exportProducts() {
        // En una implementación real, generaríamos un CSV o Excel
        this.showSuccess('Funcionalidad de exportación en desarrollo');
    }

    static showError(message) {
        alert(`❌ ${message}`);
    }

    static showSuccess(message) {
        // En una versión mejorada usaríamos toasts
        console.log(`✅ ${message}`);
    }
}

// Funciones globales
function logout() {
    AuthManager.logout();
}

function showProductModal() {
    ProductosManager.showProductModal();
}

function closeProductModal() {
    ProductosManager.closeProductModal();
}

function closeStockModal() {
    ProductosManager.closeStockModal();
}

function refreshProducts() {
    ProductosManager.refreshProducts();
}

function clearSearch() {
    ProductosManager.clearSearch();
}

function exportProducts() {
    ProductosManager.exportProducts();
}

// Inicializar gestión de productos
document.addEventListener('DOMContentLoaded', function() {
    ProductosManager.init();
});