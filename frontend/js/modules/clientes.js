class Clientes {
    constructor() {
        this.clientes = [];
    }

    async render() {
        return `
            <div class="clientes-module">
                <div class="page-header">
                    <h1>Gestión de Clientes</h1>
                    <p>Administra la base de datos de clientes</p>
                </div>

                <div class="clientes-actions card">
                    <div class="card-header">
                        <h3 class="card-title">Clientes</h3>
                        <button class="btn btn-primary" onclick="clientes.mostrarModalCliente()">
                            + Nuevo Cliente
                        </button>
                    </div>
                </div>

                <div class="clientes-table card">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Teléfono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-clientes">
                                <tr>
                                    <td colspan="5" class="text-center">Cargando clientes...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeEvents() {
        await this.cargarClientes();
    }

    async cargarClientes() {
        try {
            const result = await api.getClientes();
            if (result.success) {
                this.clientes = result.data;
                this.renderTablaClientes();
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
            this.renderTablaClientesDemo();
        }
    }

    renderTablaClientes() {
        const tbody = document.getElementById('tabla-clientes');
        
        if (!this.clientes || this.clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron clientes</td></tr>';
            return;
        }

        tbody.innerHTML = this.clientes.map(cliente => `
            <tr>
                <td>${cliente.numero_documento || 'N/A'}</td>
                <td>${cliente.nombres}</td>
                <td>${cliente.apellidos}</td>
                <td>${cliente.telefono || 'N/A'}</td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-outline btn-sm" onclick="clientes.editarCliente('${cliente.id}')">
                            Editar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderTablaClientesDemo() {
        const tbody = document.getElementById('tabla-clientes');
        tbody.innerHTML = `
            <tr>
                <td>12345678</td>
                <td>Juan</td>
                <td>Pérez</td>
                <td>987654321</td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-outline btn-sm">Editar</button>
                    </div>
                </td>
            </tr>
        `;
    }

    mostrarModalCliente() {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }

    editarCliente(clienteId) {
        notificaciones.mostrar('Funcionalidad en desarrollo', 'warning');
    }
}

const clientes = new Clientes();