document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      

    });

    const data = await response.json();

    if (response.ok) {
      // Guardar el token JWT en el almacenamiento local
      localStorage.setItem('token', data.token);

      // Mensaje de éxito
      document.getElementById("mensajeExito").textContent = "Login exitoso. Redirigiendo...";
      
      // Redirigir a la página principal o al dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html'; // Redirigir al dashboard
      }, 1500);
    } else {
      document.getElementById("mensajeError").textContent = data.error;
    }
  } catch (err) {
    document.getElementById("mensajeError").textContent = "Error al conectar con el servidor";
  }
});
