// API communication layer
class API {
    static baseURL = 'http://localhost:3000';

    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (response.status === 401) {
                // Token expirado
                AuthManager.logout();
                return;
            }

            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('API Request failed:', error);
            throw new Error('Error de conexión con el servidor');
        }
    }

    // Métodos específicos para cada endpoint
    static async getProductos(search = '') {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        return await this.request(`/api/productos${query}`);
    }

    static async getProducto(id) {
        return await this.request(`/api/productos/${id}`);
    }

    static async getClientes(search = '') {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        return await this.request(`/api/clientes${query}`);
    }

    static async createCliente(clienteData) {
        return await this.request('/api/clientes', {
            method: 'POST',
            body: JSON.stringify(clienteData)
        });
    }

    static async procesarVenta(ventaData) {
        return await this.request('/api/ventas', {
            method: 'POST',
            body: JSON.stringify(ventaData)
        });
    }

    static async getVentas(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const query = queryParams ? `?${queryParams}` : '';
        return await this.request(`/api/ventas${query}`);
    }

    static async getDashboardMetricas() {
        return await this.request('/api/dashboard/metricas');
    }

    static async getAlertas(leidas = false) {
        return await this.request(`/api/dashboard/alertas?leidas=${leidas}`);
    }

    static async marcarAlertaLeida(id) {
        return await this.request(`/api/dashboard/alertas/${id}/leida`, {
            method: 'PUT'
        });
    }
}

// Hacer disponible globalmente
window.API = API;