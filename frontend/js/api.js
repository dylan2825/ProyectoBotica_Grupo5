class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            console.log('🔗 API Request:', url, config);
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Auth endpoints
    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    // Productos endpoints
    async getProductos(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/productos${queryString ? `?${queryString}` : ''}`);
    }

    async getProducto(id) {
        return this.get(`/productos/${id}`);
    }

    async updateStock(id, stockData) {
        return this.put(`/productos/${id}/stock`, stockData);
    }

    // Ventas endpoints
    async crearVenta(ventaData) {
        return this.post('/ventas', ventaData);
    }

    async getVentas(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/ventas${queryString ? `?${queryString}` : ''}`);
    }

    // Clientes endpoints
    async getClientes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/clientes${queryString ? `?${queryString}` : ''}`);
    }

    async crearCliente(clienteData) {
        return this.post('/clientes', clienteData);
    }

    async actualizarPuntos(id, puntosData) {
        return this.put(`/clientes/${id}/puntos`, puntosData);
    }

    // Dashboard endpoints
    async getMetricas() {
        return this.get('/dashboard/metricas');
    }

    async getAlertas() {
        return this.get('/dashboard/alertas');
    }

    async marcarAlertaLeida(id) {
        return this.put(`/dashboard/alertas/${id}/leida`);
    }
}

const api = new ApiService();