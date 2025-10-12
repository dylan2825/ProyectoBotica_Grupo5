class AuthService {
    constructor() {
        this.tokenKey = 'nova_salud_token';
        this.userKey = 'nova_salud_user';
    }

    setAuthData(token, userData) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        api.setToken(token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getUserData() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    getUserRole() {
        const userData = this.getUserData();
        return userData?.rol || null;
    }

    async login(username, password) {
        try {
            console.log('🔐 Intentando login con:', username);
            
            const result = await api.login({ username, password });
            
            if (result.success) {
                this.setAuthData(result.data.token, result.data.user);
                console.log('✅ Login exitoso');
                return { success: true };
            } else {
                console.log('❌ Login fallido:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('🚨 Error de conexión:', error);
            return { 
                success: false, 
                error: 'No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000' 
            };
        }
    }

    async validateToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const result = await api.getProfile();
            return result.success;
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
            return false;
        }
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        api.setToken(null);
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

const auth = new AuthService();