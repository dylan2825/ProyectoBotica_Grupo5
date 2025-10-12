class App {
    constructor() {
        this.currentView = '';
        this.isAuthenticated = false;
        this.userRole = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    async checkAuth() {
        const token = auth.getToken();
        
        if (token && await auth.validateToken()) {
            this.isAuthenticated = true;
            this.userRole = auth.getUserRole();
            this.showMainLayout();
            this.loadView('dashboard');
        } else {
            this.showLogin();
        }
    }

    showMainLayout() {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        this.renderHeader();
        this.renderSidebar();
    }

    showLogin() {
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('main-container').classList.add('hidden');
        this.renderLogin();
    }

    renderHeader() {
        const user = auth.getUserData();
        const header = document.getElementById('main-header');
        
        header.innerHTML = `
            <div class="header-content">
                <div class="header-left">
                    <h1 class="logo">Nova Salud</h1>
                </div>
                <div class="header-right">
                    <span class="user-info">Bienvenido, ${user?.nombres || 'Usuario'}</span>
                    <span class="user-role">${this.userRole}</span>
                    <button class="btn btn-outline btn-sm" onclick="app.logout()">Cerrar Sesión</button>
                </div>
            </div>
        `;
    }

    renderSidebar() {
        const sidebar = document.getElementById('main-sidebar');
        const isAdmin = this.userRole === 'admin';
        
        sidebar.innerHTML = `
            <nav class="sidebar-nav">
                <ul>
                    <li>
                        <a href="#" class="nav-link active" data-view="dashboard">
                            <span>📊 Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="nav-link" data-view="ventas">
                            <span>🛒 Punto de Venta</span>
                        </a>
                    </li>
                    ${isAdmin ? `
                    <li>
                        <a href="#" class="nav-link" data-view="inventario">
                            <span>📦 Inventario</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="nav-link" data-view="clientes">
                            <span>👥 Clientes</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="nav-link" data-view="alertas">
                            <span>🔔 Alertas</span>
                        </a>
                    </li>
                    ` : ''}
                </ul>
            </nav>
        `;
    }

    renderLogin() {
        const container = document.getElementById('login-container');
        container.innerHTML = `
            <div class="login-card">
                <div class="login-header">
                    <div class="logo">Nova Salud</div>
                    <h1>Sistema de Gestión</h1>
                    <p>Ingresa a tu cuenta</p>
                </div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label">Usuario</label>
                        <input type="text" class="form-control" id="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Contraseña</label>
                        <input type="password" class="form-control" id="password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Iniciar Sesión
                    </button>
                </form>
                
                <div id="login-error" class="error-message hidden"></div>
                
                <div class="login-footer">
                    <p>Sistema desarrollado para Botica Nova Salud</p>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            const result = await auth.login(username, password);
            
            if (result.success) {
                this.isAuthenticated = true;
                this.userRole = auth.getUserRole();
                this.showMainLayout();
                this.loadView('dashboard');
                notificaciones.mostrar('Bienvenido al sistema', 'success');
            } else {
                errorDiv.textContent = result.error || 'Error en el login';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'Error de conexión con el servidor';
            errorDiv.classList.remove('hidden');
            console.error('Login error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const view = e.target.closest('.nav-link').dataset.view;
                this.loadView(view);
            }
        });
    }

    async loadView(viewName) {
        if (!this.isAuthenticated) return;

        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-view="${viewName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentView = viewName;
        const container = document.getElementById('view-container');
        
        try {
            // Cargar el HTML de la vista
            const response = await fetch(`views/${viewName}.html`);
            
            if (!response.ok) {
                throw new Error('Vista no encontrada');
            }
            
            const html = await response.text();
            container.innerHTML = html;
            
            // Inicializar eventos específicos de la vista
            this.initializeViewEvents(viewName);
            
        } catch (error) {
            console.error('Error loading view:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="error-view text-center">
                        <h3>Error al cargar la vista</h3>
                        <p>No se pudo cargar la página: ${viewName}</p>
                        <button class="btn btn-primary" onclick="app.loadView('dashboard')">
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }

    initializeViewEvents(viewName) {
        switch(viewName) {
            case 'dashboard':
                if (typeof dashboard.initializeEvents === 'function') {
                    dashboard.initializeEvents();
                }
                break;
            case 'ventas':
                if (typeof ventas.initializeEvents === 'function') {
                    ventas.initializeEvents();
                }
                break;
            case 'inventario':
                if (typeof inventario.initializeEvents === 'function') {
                    inventario.initializeEvents();
                }
                break;
            case 'clientes':
                if (typeof clientes.initializeEvents === 'function') {
                    clientes.initializeEvents();
                }
                break;
            case 'alertas':
                if (typeof alertas.initializeEvents === 'function') {
                    alertas.initializeEvents();
                }
                break;
        }
    }

    logout() {
        auth.logout();
        this.isAuthenticated = false;
        this.userRole = null;
        this.showLogin();
        notificaciones.mostrar('Sesión cerrada correctamente', 'success');
    }
}

// Inicializar aplicación
const app = new App();