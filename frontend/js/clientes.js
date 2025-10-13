// Gestión de Clientes
class ClientesManager {
    constructor() {
        this.clientes = [];
        this.init();
    }

    async init() {
        await this.cargarClientes();
        this.configurarEventos();
    }

    async cargarClientes() {
        try {
            mostrarLoading(true);
            const response = await api.clientes.obtenerTodos();
            
            if (response.success) {
                this.clientes = response.data;
                this.renderizarClientes();
            } else {
                mostrarError('Error al cargar clientes: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar clientes');
        } finally {
            mostrarLoading(false);
        }
    }

    renderizarClientes() {
        const tbody = document.getElementById('clientesBody');
        tbody.innerHTML = '';

        this.clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.nombre || 'N/A'}</td>
                <td>${cliente.email || 'N/A'}</td>
                <td>${cliente.telefono || 'N/A'}</td>
                <td>${cliente.direccion || 'N/A'}</td>
                <td>
                    <button class="btn-editar" onclick="clientesManager.editarCliente(${cliente.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn-eliminar" onclick="clientesManager.eliminarCliente(${cliente.id})">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    abrirModalCliente(cliente = null) {
        const modal = document.getElementById('modalCliente');
        const titulo = document.getElementById('modalClienteTitulo');
        const form = document.getElementById('formCliente');
        
        form.reset();
        
        if (cliente) {
            titulo.textContent = 'Editar Cliente';
            document.getElementById('clienteId').value = cliente.id;
            document.getElementById('clienteNombre').value = cliente.nombre || '';
            document.getElementById('clienteEmail').value = cliente.email || '';
            document.getElementById('clienteTelefono').value = cliente.telefono || '';
            document.getElementById('clienteDireccion').value = cliente.direccion || '';
        } else {
            titulo.textContent = 'Nuevo Cliente';
            document.getElementById('clienteId').value = '';
        }
        
        modal.style.display = 'block';
    }

    async guardarCliente() {
        const formData = {
            nombre: document.getElementById('clienteNombre').value,
            email: document.getElementById('clienteEmail').value,
            telefono: document.getElementById('clienteTelefono').value,
            direccion: document.getElementById('clienteDireccion').value
        };

        const clienteId = document.getElementById('clienteId').value;

        if (!formData.nombre.trim()) {
            mostrarError('El nombre del cliente es obligatorio');
            return;
        }

        try {
            mostrarLoading(true);
            let response;

            if (clienteId) {
                response = await api.clientes.actualizar(clienteId, formData);
            } else {
                response = await api.clientes.crear(formData);
            }

            if (response.success) {
                mostrarExito(clienteId ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
                this.cerrarModalCliente();
                await this.cargarClientes();
            } else {
                mostrarError('Error: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error al guardar el cliente');
        } finally {
            mostrarLoading(false);
        }
    }

    async eliminarCliente(id) {
        if (!confirm('¿Estás seguro de eliminar este cliente?')) {
            return;
        }

        try {
            mostrarLoading(true);
            const response = await api.clientes.eliminar(id);
            
            if (response.success) {
                mostrarExito('Cliente eliminado correctamente');
                await this.cargarClientes();
            } else {
                mostrarError('Error al eliminar cliente: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error al eliminar el cliente');
        } finally {
            mostrarLoading(false);
        }
    }

    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.abrirModalCliente(cliente);
        }
    }

    cerrarModalCliente() {
        document.getElementById('modalCliente').style.display = 'none';
    }

    configurarEventos() {
        // Cerrar modal al hacer click fuera
        document.getElementById('modalCliente').addEventListener('click', (e) => {
            if (e.target.id === 'modalCliente') {
                this.cerrarModalCliente();
            }
        });
    }
}

// Funciones globales para HTML
function abrirModalCliente() {
    clientesManager.abrirModalCliente();
}

function cerrarModalCliente() {
    clientesManager.cerrarModalCliente();
}

function guardarCliente() {
    clientesManager.guardarCliente();
}

// Inicialización
let clientesManager;

document.addEventListener('DOMContentLoaded', function() {
    clientesManager = new ClientesManager();
});