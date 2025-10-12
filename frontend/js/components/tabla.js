class TablaComponent {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.data = [];
    }

    render(data) {
        this.data = data;
        
        if (this.data.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>No se encontraron registros</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            ${this.config.columns.map(col => `
                                <th>${col.title}</th>
                            `).join('')}
                            ${this.config.actions ? '<th>Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.data.forEach((item) => {
            html += `
                <tr>
                    ${this.config.columns.map(col => `
                        <td>${this.formatCell(item[col.field], col.type)}</td>
                    `).join('')}
                    ${this.config.actions ? `
                        <td>
                            <div class="acciones">
                                ${this.config.actions.map(action => `
                                    <button class="btn btn-outline btn-sm" 
                                            onclick="${action.onclick}('${item.id}')">
                                        ${action.label}
                                    </button>
                                `).join('')}
                            </div>
                        </td>
                    ` : ''}
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        this.container.innerHTML = html;
    }

    formatCell(value, type) {
        if (value === null || value === undefined) return 'N/A';

        switch (type) {
            case 'currency':
                return `S/ ${parseFloat(value).toFixed(2)}`;
            case 'date':
                return new Date(value).toLocaleDateString('es-ES');
            case 'boolean':
                return value ? 'Sí' : 'No';
            case 'status':
                return `<span class="status-badge ${value ? 'status-active' : 'status-inactive'}">
                    ${value ? 'Activo' : 'Inactivo'}
                </span>`;
            default:
                return value;
        }
    }
}