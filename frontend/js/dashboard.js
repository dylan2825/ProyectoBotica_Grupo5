document.addEventListener("DOMContentLoaded", async function() {
  const obtenerMetricas = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/dashboard/metricas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Enviar el token JWT en el encabezado
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar el DOM con los datos obtenidos
        document.getElementById("ventasHoy").textContent = `Total Ventas: ${data.data.ventas_hoy.total_ventas} | Ingresos: S/ ${data.data.ventas_hoy.ingresos.toFixed(2)}`;
        document.getElementById("productosBajoStock").textContent = `${data.data.stock_bajo.total} productos con stock bajo`;

        const productosMasVendidos = document.getElementById("productosMasVendidos");
        productosMasVendidos.innerHTML = "";
        data.data.top_productos.forEach(producto => {
          const li = document.createElement("li");
          li.textContent = `${producto.nombre}: ${producto.total_vendido} unidades vendidas`;
          productosMasVendidos.appendChild(li);
        });

        document.getElementById("alertasPendientes").textContent = `${data.data.alertas_pendientes.total} alertas no leídas`;
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error al obtener las métricas", err);
      alert("Error al cargar las métricas");
    }
  };

  obtenerMetricas();
});
