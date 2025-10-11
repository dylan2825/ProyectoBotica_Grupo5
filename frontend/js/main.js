document.addEventListener("DOMContentLoaded", async function() {
  // Función para obtener productos
  if (window.location.pathname.includes("productos.html")) {
    obtenerProductos();
  }

  // Función para obtener ventas
  if (window.location.pathname.includes("ventas.html")) {
    obtenerVentas();
  }

  // Función para obtener métricas del dashboard
  if (window.location.pathname.includes("dashboard.html")) {
    obtenerMetricas();
  }

  // Función para obtener clientes
  if (window.location.pathname.includes("clientes.html")) {
    obtenerClientes();
  }

  // Función para agregar cliente
  if (window.location.pathname.includes("clientes.html")) {
    const formCliente = document.getElementById('form-cliente');
    formCliente.addEventListener('submit', async function(e) {
      e.preventDefault();
      const cliente = {
        nombre: document.getElementById('nombre').value,
        apellido_paterno: document.getElementById('apellido_paterno').value,
        apellido_materno: document.getElementById('apellido_materno').value,
        numero_documento: document.getElementById('numero_documento').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
      };
      await agregarCliente(cliente);
    });
  }
});

// Función para obtener productos desde el backend y mostrarlos en la página
async function obtenerProductos() {
  try {
    const response = await fetch('http://localhost:3000/api/productos');
    const data = await response.json();
    
    const listaProductos = document.getElementById('productos-lista');
    
    if (data.success && data.data.length > 0) {
      data.data.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} - S/${producto.precio_venta}`;
        listaProductos.appendChild(li);
      });
    } else {
      listaProductos.innerHTML = '<li>No hay productos disponibles.</li>';
    }
  } catch (error) {
    console.error('Error obteniendo productos:', error);
  }
}

// Función para obtener ventas desde el backend y mostrarlas en la página
async function obtenerVentas() {
  try {
    const response = await fetch('http://localhost:3000/api/ventas');
    const data = await response.json();
    
    const listaVentas = document.getElementById('ventas-lista');
    
    if (data.success && data.data.length > 0) {
      data.data.forEach(venta => {
        const li = document.createElement('li');
        li.textContent = `Venta ${venta.codigo_venta} - Total: S/${venta.total_final}`;
        listaVentas.appendChild(li);
      });
    } else {
      listaVentas.innerHTML = '<li>No hay ventas disponibles.</li>';
    }
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
  }
}

// Función para obtener métricas del dashboard
async function obtenerMetricas() {
  try {
    const response = await fetch('http://localhost:3000/api/dashboard');
    const data = await response.json();
    
    const metrics = document.getElementById('metrics');
    
    if (data.success) {
      metrics.innerHTML = `
        <p>Total Ventas Hoy: ${data.data.ventas_hoy.total_ventas}</p>
        <p>Ingresos Hoy: S/${data.data.ventas_hoy.ingresos}</p>
        <p>Productos con Stock Bajo: ${data.data.stock_bajo.total}</p>
        <p>Alertas Pendientes: ${data.data.alertas_pendientes.total}</p>
      `;
    } else {
      metrics.innerHTML = '<p>No se pudieron obtener las métricas.</p>';
    }
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
  }
}

// Función para obtener clientes desde el backend y mostrarlos en la página
async function obtenerClientes() {
  try {
    const response = await fetch('http://localhost:3000/api/clientes');
    const data = await response.json();
    
    const listaClientes = document.getElementById('clientes-lista');
    
    if (data.success && data.data.length > 0) {
      data.data.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = `${cliente.nombres} ${cliente.apellido_paterno} - ${cliente.email}`;
        listaClientes.appendChild(li);
      });
    } else {
      listaClientes.innerHTML = '<li>No hay clientes disponibles.</li>';
    }
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
  }
}

// Función para agregar un nuevo cliente
async function agregarCliente(cliente) {
  try {
    const response = await fetch('http://localhost:3000/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Cliente agregado exitosamente');
      obtenerClientes(); // Actualiza la lista de clientes después de agregar
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error agregando cliente:', error);
    alert('Error al agregar cliente');
  }
}
