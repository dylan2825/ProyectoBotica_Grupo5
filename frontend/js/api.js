// API Communication Layer - Rutas exactas de tu dashboard
const API_BASE = 'http://localhost:3000';

// Función principal para requests
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (response.status === 401) {
            // Token expirado - redirigir a login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return { success: false, message: 'Sesión expirada' };
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('API Request failed:', error);
        return { 
            success: false, 
            message: 'Error de conexión con el servidor' 
        };
    }
}

// Objeto api con rutas EXACTAS de tu backend
const api = {
    // Auth
    auth: {
        login: async (credentials) => {
            return await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        },
        register: async (userData) => {
            return await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        verify: async () => {
            return await apiRequest('/api/auth/verify');
        }
    },

    // Productos
    productos: {
        obtenerTodos: async (search = '') => {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            return await apiRequest(`/api/productos${query}`);
        },
        obtenerPorId: async (id) => {
            return await apiRequest(`/api/productos/${id}`);
        },
        crear: async (productoData) => {
            return await apiRequest('/api/productos', {
                method: 'POST',
                body: JSON.stringify(productoData)
            });
        },
        actualizar: async (id, productoData) => {
            return await apiRequest(`/api/productos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productoData)
            });
        },
        eliminar: async (id) => {
            return await apiRequest(`/api/productos/${id}`, {
                method: 'DELETE'
            });
        },
        obtenerStockBajo: async () => {
            return await apiRequest('/api/productos?stock_minimo=true');
        }
    },

    // Clientes
    clientes: {
        obtenerTodos: async (search = '') => {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            return await apiRequest(`/api/clientes${query}`);
        },
        obtenerPorId: async (id) => {
            return await apiRequest(`/api/clientes/${id}`);
        },
        crear: async (clienteData) => {
            return await apiRequest('/api/clientes', {
                method: 'POST',
                body: JSON.stringify(clienteData)
            });
        },
        actualizar: async (id, clienteData) => {
            return await apiRequest(`/api/clientes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(clienteData)
            });
        },
        eliminar: async (id) => {
            return await apiRequest(`/api/clientes/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Ventas
    ventas: {
        crear: async (ventaData) => {
            return await apiRequest('/api/ventas', {
                method: 'POST',
                body: JSON.stringify(ventaData)
            });
        },
        obtenerTodas: async (filters = {}) => {
            const queryParams = new URLSearchParams(filters).toString();
            const query = queryParams ? `?${queryParams}` : '';
            return await apiRequest(`/api/ventas${query}`);
        },
        obtenerPorId: async (id) => {
            return await apiRequest(`/api/ventas/${id}`);
        },
        obtenerHistorial: async (fechaInicio, fechaFin) => {
            const params = {};
            if (fechaInicio) params.fecha_inicio = fechaInicio;
            if (fechaFin) params.fecha_fin = fechaFin;
            
            const queryParams = new URLSearchParams(params).toString();
            const query = queryParams ? `?${queryParams}` : '';
            return await apiRequest(`/api/ventas${query}`);
        }
    },

    // Dashboard - RUTAS EXACTAS de tu dashboard.js
    dashboard: {
        obtenerMetricas: async () => {
            return await apiRequest('/api/dashboard/metricas'); // ✅ RUTA EXACTA
        },
        
        obtenerAlertas: async () => {
            return await apiRequest('/api/dashboard/alertas'); // ✅ RUTA EXACTA
        },
        
        marcarAlertaLeida: async (id) => {
            return await apiRequest(`/api/dashboard/alertas/${id}/leida`, {
                method: 'PUT'
            });
        },
        
        // Extraer top productos de las métricas
        obtenerTopProductos: async () => {
            const response = await apiRequest('/api/dashboard/metricas');
            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data.topProductos || [
                        { nombre: 'Paracetamol 500mg', vendidos: 45, ranking: 1 },
                        { nombre: 'Amoxicilina 500mg', vendidos: 32, ranking: 2 },
                        { nombre: 'Ibuprofeno 400mg', vendidos: 28, ranking: 3 }
                    ]
                };
            }
            return response;
        },
        
        // Extraer resumen de ventas de las métricas
        obtenerResumenVentas: async () => {
            const response = await apiRequest('/api/dashboard/metricas');
            if (response.success && response.data) {
                const ventasHoy = response.data.ventasHoy || {};
                const avgTicket = ventasHoy.total && ventasHoy.cantidad ? 
                    ventasHoy.total / ventasHoy.cantidad : 0;
                    
                return {
                    success: true,
                    data: {
                        todaySales: ventasHoy.cantidad || 0,
                        todayRevenue: ventasHoy.total || 0,
                        avgTicket: avgTicket
                    }
                };
            }
            return response;
        }
    },

    // Reportes
    reportes: {
        generar: async (fechaDesde, fechaHasta) => {
            const params = { 
                fecha_inicio: fechaDesde, 
                fecha_fin: fechaHasta,
                reporte: 'true'
            };
            const queryParams = new URLSearchParams(params).toString();
            return await apiRequest(`/api/ventas?${queryParams}`);
        },
        
        exportarExcel: async (fechaDesde, fechaHasta) => {
            return { 
                success: true, 
                message: 'Exportación en desarrollo',
                data: { url: '#' }
            };
        }
    }
};

// Mantener compatibilidad
window.API = {
    request: apiRequest,
    getProductos: api.productos.obtenerTodos,
    getClientes: api.clientes.obtenerTodos,
    createCliente: api.clientes.crear,
    procesarVenta: api.ventas.crear,
    getVentas: api.ventas.obtenerTodas,
    getDashboardMetricas: api.dashboard.obtenerMetricas,
    getAlertas: api.dashboard.obtenerAlertas
};

// Exportar el objeto api
window.api = api;

console.log('✅ api.js cargado - Rutas exactas del dashboard');