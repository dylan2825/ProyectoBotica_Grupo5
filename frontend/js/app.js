// Configuración global de la aplicación
class App {
    static init() {
        console.log('🚀 Nova Salud - Sistema inicializado');
        this.setupAPIInterceptors();
    }

    static setupAPIInterceptors() {
        // Interceptor global para agregar token a las peticiones
    }

    static async apiCall(endpoint, options = {}) {
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
            const response = await fetch(`http://localhost:3000${endpoint}`, config);
            return await response.json();
        } catch (error) {
            console.error('API Call error:', error);
            throw error;
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});