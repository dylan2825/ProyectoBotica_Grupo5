async function obtenerVentas() {
  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;
  const page = 1; // Puedes agregar paginación aquí
  const limit = 50;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:5000/ventas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      mostrarVentas(data.data);
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Error al obtener las ventas");
  }
}

function mostrarVentas(ventas) {
  const listaVentas = document.getElementById("ventasLista");
  listaVentas.innerHTML = "";

  ventas.forEach(venta => {
    const li = document.createElement("li");
    li.textContent = `Código Venta: ${venta.codigo_venta}, Total: S/ ${venta.total}, Cliente: ${venta.cliente_nombres}`;
    listaVentas.appendChild(li);
  });
}
